import cruftDDB, { EnhancedItem } from '@honesty-store/cruft';
import { CodedError } from '@honesty-store/service/lib/error';
import { createServiceKey } from '@honesty-store/service/lib/key';
import { lambdaRouter, LambdaRouter } from '@honesty-store/service/lib/lambdaRouter';
import { assertBalanceWithinLimit, assertValidTransaction, extractFieldsFromTransactionId } from '@honesty-store/transaction';
import { v4 as uuid } from 'uuid';

import { attemptTopup, createCustomer } from './stripe';

import {
  CardDetails,
  TopupAccount,
  TopupAttempted,
  TopupCardDetailsChanged,
  TopupEvent,
  TopupRequest,
  TopupResponse,
  TopupSuccess,
  TransactionWithBalance
} from './client';

import {
  assertOptional,
  assertValidString,
  assertValidUuid,
  createAssertValidObject,
  createAssertValidUuid
} from '@honesty-store/service/lib/assert';

const { read, reduce } = cruftDDB<TopupAccount>({
  tableName: process.env.TABLE_NAME,
  limit: 100
});

const assertValidAccountId = createAssertValidUuid('accountId');

const assertValidTopupAmount = (key: string, amount: any) => {
  if (amount !== 0 && amount !== 500) {
    throw new Error(`${key} must be £0 or £5`);
  }
};

const assertValidTopupRequest = createAssertValidObject<TopupRequest>({
  accountId: assertValidUuid,
  amount: assertValidTopupAmount,
  stripeToken: assertOptional(assertValidString),
  userId: assertValidUuid
});

const extractCardDetails = ({ id, stripe }: TopupAccount): CardDetails => {
  if (stripe == null) {
    throw new CodedError('NoCardDetailsPresent', `No stripe details registered for account ${id}`);
  }
  const { brand, exp_month, exp_year, last4 } = stripe.customer.sources.data[0];
  return {
    brand,
    expMonth: exp_month,
    expYear: exp_year,
    last4
  };
};

const reducer = reduce<TopupEvent | TransactionWithBalance>(
  event => {
    switch (event.type) {
      case 'topup-card-details-change':
      case 'topup-attempt':
        return event.accountId;
      case 'topup':
      case 'purchase':
      case 'refund':
      case 'debit':
      case 'credit':
        return extractFieldsFromTransactionId(event.id).accountId;
    }
  },
  event => event.id,
  async (topupAccount, event, _emit) => {
    const key = createServiceKey({ service: 'topup' });

    switch (event.type) {
      case 'topup-card-details-change': {
        const { stripeToken } = event;
        const { stripe, stripeHistory: previousStripeHistory = [] } = topupAccount;

        const stripeHistory = stripe == null ?
          [] : [...previousStripeHistory, stripe];

        const updatedStripe = await createCustomer(key, topupAccount, stripeToken);

        return {
          ...topupAccount,
          stripe: updatedStripe,
          stripeHistory
        };
      }
      case 'topup-attempt': {
        const { id, stripe } = topupAccount;
        const { id: eventId, amount } = event;

        if (stripe == null) {
          throw new Error(`No Stripe details found for ${id}.`);
        }

        const updatedStatus = await attemptTopup(key, topupAccount, eventId, amount);

        return {
          ...topupAccount,
          stripe: {
            ...stripe,
            nextChargeToken: uuid()
          },
          status: updatedStatus
        };
      }
      case 'topup': {
        const { id, status } = topupAccount;

        if (status == null) {
          // old-skool topup
          return topupAccount;
        }

        if (status.status !== 'in-progress') {
          throw new Error(`Invalid status ${status.status} for receiving a topup ${id}`);
        }

        const { balance, ...transaction } = event;

        const updatedStatus: TopupSuccess = {
          status: 'success',
          transactionAndBalance: { balance, transaction },
          timestamp: Date.now()
        };

        return {
          ...topupAccount,
          status: updatedStatus
        };
      }
      case 'purchase':
      case 'refund':
      case 'debit':
      case 'credit': {
        const { id, stripe } = topupAccount;
        const { id: eventId, balance } = event;

        if (stripe == null) {
          throw new Error(`No Stripe details found for ${id}.`);
        }

        if (balance > -500) {
          return topupAccount;
        }

        const updatedStatus = await attemptTopup(key, topupAccount, eventId, -balance);

        return {
          ...topupAccount,
          stripe: {
            ...stripe,
            nextChargeToken: uuid()
          },
          status: updatedStatus
        };
      }
    }
  },
  (event) => {
    if (event.type !== 'topup-card-details-change') {
      throw new Error(`Can only create topup account for topup-card-details-change events.`);
    }
    const { accountId: id, userId } = event;
    return {
      id,
      userId,
      version: 0,
      test: false
    };
  });

export const router: LambdaRouter = lambdaRouter('topup', 1);

router.post<TopupRequest, TopupResponse>(
  '/',
  async (key, { }, topupRequest) => {
    assertValidTopupRequest(topupRequest);

    const { accountId, userId, amount: dirtyAmount, stripeToken } = topupRequest;

    let topupAccount: EnhancedItem<TopupAccount> | undefined;

    if (stripeToken != null) {
      const event: TopupCardDetailsChanged = {
        id: uuid(),
        type: 'topup-card-details-change',
        userId,
        accountId,
        stripeToken
      };
      topupAccount = await reducer(event);
    }

    const amount = Number(dirtyAmount);
    if (amount > 0) {
      const event: TopupAttempted = {
        id: uuid(),
        type: 'topup-attempt',
        userId,
        accountId,
        amount
      };

      await assertBalanceWithinLimit({ key, accountId, amount });

      topupAccount = await reducer(event, topupAccount);
    }

    if (topupAccount == null) {
      throw new Error('Nothing to do, invalid request');
    }

    return {
      cardDetails: extractCardDetails(topupAccount)
    };

  }
);

router.post<TransactionWithBalance, TopupAccount>(
  '/',
  async (_key, { }, { balance, ...transaction }) => {
    assertValidTransaction(transaction);

    return await reducer({ balance, ...transaction });
  }
);

router.get<CardDetails>(
  '/:id/cardDetails',
  async (_key, { id }) => {
    assertValidAccountId(id);
    return extractCardDetails(await read(id));
  }
);

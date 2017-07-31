import cruftDDB, { EnhancedItem } from '@honesty-store/cruft';
import { CodedError } from '@honesty-store/service/lib/error';
import { createServiceKey } from '@honesty-store/service/lib/key';
import { lambdaRouter, LambdaRouter } from '@honesty-store/service/lib/lambdaRouter';
import { assertBalanceWithinLimit, assertValidTransaction, extractFieldsFromTransactionId } from '@honesty-store/transaction';

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
  assertNever,
  assertOptional,
  assertValidString,
  assertValidUuid,
  createAssertValidObject,
  createAssertValidUuid
} from '@honesty-store/service/lib/assert';

const { read, reduce } = cruftDDB<TopupAccount, TopupEvent | TransactionWithBalance>({
  tableName: process.env.TABLE_NAME,
  region: process.env.AWS_REGION,
  limit: 100
});

const assertValidAccountId = createAssertValidUuid('accountId');

const assertValidTopupAmount = (key: string, amount: any) => {
  if (amount !== 0 && amount !== 500) {
    throw new Error(`${key} must be £0 or £5`);
  }
};

const assertValidTopupRequest = createAssertValidObject<TopupRequest>({
  id: assertValidUuid,
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

const reducer = reduce(
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
      default:
        return assertNever(event);
    }
  },
  event => event.id,
  async (topupAccount, event, _emit) => {
    const key = createServiceKey({ service: 'topup' });

    switch (event.type) {
      case 'topup-card-details-change': {
        const { id: eventId, stripeToken } = event;
        const { stripe, stripeHistory: previousStripeHistory = [], status } = topupAccount;

        const stripeHistory = stripe == null ?
          [] : [...previousStripeHistory, stripe];

        const updatedStripe = await createCustomer(key, topupAccount, stripeToken);

        if (status == null || status.status !== 'error') {
          return {
            ...topupAccount,
            stripe: updatedStripe,
            stripeHistory
          };
        }

        const updatedStatus = await attemptTopup(key, topupAccount, eventId, status.amount);

        return {
          ...topupAccount,
          stripe: updatedStripe,
          stripeHistory,
          status: updatedStatus
        };
      }
      case 'topup-attempt': {
        const { id, stripe } = topupAccount;
        const { id: eventId, amount } = event;

        if (stripe == null) {
          throw new Error(`No Stripe details found for ${id}.`);
        }

        const updatedStatus = await attemptTopup(key, topupAccount, eventId, amount);

        if (updatedStatus == null) {
          throw new CodedError('CardError', 'Topup refused, contact support');
        }

        return {
          ...topupAccount,
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
          status: updatedStatus
        };
      }
      default:
        return assertNever(event);
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

    const { id, accountId, userId, amount: dirtyAmount, stripeToken } = topupRequest;

    // This endpoint is unecessarily overloaded but we don't want to change it at this point.
    // Therefore to avoid skipping the second action (both actions would normally use the same
    // id), we mutate the event id slightly (under the assumption that we'll still be incredibly
    // unlikely to see a collision).

    let topupAccount: EnhancedItem<TopupAccount> | undefined;

    if (stripeToken != null) {
      const event: TopupCardDetailsChanged = {
        id: id.replace(/.$/, '0'),
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
        id: id.replace(/.$/, '1'),
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

    if (topupAccount.status != null && topupAccount.status.status === 'error') {
      throw new CodedError(topupAccount.status.code, 'Topup failed');
    }

    return {
      cardDetails: extractCardDetails(topupAccount)
    };
  }
);

router.post<TransactionWithBalance, TopupAccount>(
  '/transaction',
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

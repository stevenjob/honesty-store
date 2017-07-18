import cruftDDB, { EnhancedItem } from '@honesty-store/cruft';
import { CodedError } from '@honesty-store/service/lib/error';
import { createServiceKey } from '@honesty-store/service/lib/key';
import { lambdaRouter, LambdaRouter } from '@honesty-store/service/lib/lambdaRouter';
import { error } from '@honesty-store/service/lib/log';
import { assertBalanceWithinLimit, assertValidTransaction, createTransaction, extractFieldsFromTransactionId } from '@honesty-store/transaction';
import * as stripeFactory from 'stripe';
import { v4 as uuid } from 'uuid';
import { isRetryableStripeError, userErrorCodeFromStripeError, userErrorFromStripeError } from './errors';

import {
  CardDetails,
  TopupAccount,
  TopupAttempted,
  TopupCardDetailsChanged,
  TopupError,
  TopupEvent,
  TopupInProgress,
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

const stripeTest = stripeFactory(process.env.TEST_STRIPE_KEY);
const stripeProd = stripeFactory(process.env.LIVE_STRIPE_KEY);

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

const stripeForUser = ({ test }) => {
  return test ? stripeTest : stripeProd;
};

const getStripeCustomerId = ({ id, stripe }: TopupAccount) => {
  if (stripe == null) {
    throw new Error(`No Stripe details found for ${id}.`);
  }
  return stripe.customer.id;
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
        const { id, stripe, stripeHistory: previousStripeHistory = [] } = topupAccount;

        const description = stripe == null ?
          `registration for ${id}` : `adding new card for ${id}`;

        // throw new Error(`check for pending payment`)

        const stripeHistory = stripe == null ?
          [] : [...previousStripeHistory, stripe];

        let customer;
        try {
          customer = await stripeForUser(topupAccount)
            .customers
            .create({
              source: stripeToken,
              description,
              metadata: {
                accountId: id
              }
            });
        } catch (e) {
          error(key, `couldn't create stripe customer`, e);
          throw userErrorFromStripeError(e);
        }

        return {
          ...topupAccount,
          stripe: {
            customer,
            nextChargeToken: uuid()
          },
          stripeHistory
        };
      }
      case 'topup-attempt': {
        const { id, stripe } = topupAccount;
        const { amount } = event;

        if (stripe == null) {
          throw new Error(`No Stripe details found for ${id}.`);
        }

        await assertBalanceWithinLimit({ key, accountId: id, amount });

        let charge;

        try {
          charge = await stripeForUser(topupAccount).charges.create(
            {
              amount,
              currency: 'gbp',
              customer: stripe.customer.id,
              description: `topup for ${id}`,
              metadata: {
                accountId: id
              },
              expand: ['balance_transaction']
            },
            {
              idempotency_key: stripe.nextChargeToken
            }
          );
        } catch (e) {
          /* Note to future devs: 'Must provide source or customer.'
          * appears to be a bug with stripe's API.
          *
          * We've correctly provided a customer, so the error seems odd. I
          * believe it's to do with the idempotency_key being incorrect, so
          * that's the first place to start looking. */
          error(key, `couldn't create stripe charge`, e);
          throw userErrorFromStripeError(e);
        }

        const topup = await createTransaction(key, id, {
          type: 'topup',
          amount,
          data: {
            stripeFee: String(charge.balance_transaction.fee),
            chargeId: String(charge.id),
            topupCustomerId: stripe.customer.id
          }
        });

        return {
          ...topupAccount,
          stripe: {
            ...stripe,
            nextChargeToken: uuid()
          },
          lastTopup: topup
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
        const { id, status } = topupAccount;

        if (status == null) {
          // old-skool topup
          return topupAccount;
        }

        if (status.status === 'success' && status.timestamp >= Date.now() - ms('24h')) {
          // safety valve, don't charge multiple times in 24h period
          return topupAccount;
        }

        if (status.status === 'in-progress') {
          // existing topup must complete
          return topupAccount;
        }

        if (status.status === 'error' && status.retriesRemaining === 0) {
          // user must update card details
          return topupAccount;
        }

        const { id: eventId, balance } = event;

        if (balance > -500) {
          return topupAccount;
        }

        const amount = -balance;

        try {
          const topupCustomerId = getStripeCustomerId(topupAccount);
          const charge = await stripeForUser(topupAccount).charges.create(
            {
              amount,
              currency: 'gbp',
              customer: topupCustomerId,
              description: `topup for ${id}`,
              metadata: {
                accountId: id
              },
              expand: ['balance_transaction']
            },
            {
              idempotency_key: eventId
            }
          );

          const updatedStatus: TopupInProgress = {
            status: 'in-progress',
            amount,
            stripeFee: charge.balance_transaction.fee,
            chargeId: charge.id,
            topupCustomerId: topupCustomerId
          };

          return {
            ...topupAccount,
            status: updatedStatus
          };
        } catch (e) {
          /* Note to future devs: 'Must provide source or customer.'
          * appears to be a bug with stripe's API.
          *
          * We've correctly provided a customer, so the error seems odd. I
          * believe it's to do with the idempotency_key being incorrect, so
          * that's the first place to start looking. */
          error(key, `couldn't create stripe charge`, e);

          const retriesRemaining = isRetryableStripeError(e) ?
            (status.status !== 'error' ? 2 : status.retriesRemaining - 1) : 0;

          const updatedStatus: TopupError = {
            status: 'error',
            amount,
            code: userErrorCodeFromStripeError(e),
            retriesRemaining
          };

          return {
            ...topupAccount,
            status: updatedStatus
          };
        }
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
  async (_key, { }, topupRequest) => {
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

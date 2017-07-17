import cruftDDB from '@honesty-store/cruft';
import { CodedError } from '@honesty-store/service/lib/error';
import { createServiceKey } from '@honesty-store/service/lib/key';
import { lambdaRouter, LambdaRouter } from '@honesty-store/service/lib/lambdaRouter';
import { error } from '@honesty-store/service/lib/log';
import { assertBalanceWithinLimit, createTransaction } from '@honesty-store/transaction';
import * as stripeFactory from 'stripe';
import { v4 as uuid } from 'uuid';
import { userErrorFromStripeError } from './errors';

import {
  CardDetails,
  Stripe,
  TopupAccount,
  TopupAttempted,
  TopupCardDetailsChanged,
  TopupEvent,
  TopupRequest,
  TopupResponse
} from './client';

import {
  assertNever,
  assertObject,
  assertOptional,
  assertPositiveInteger,
  assertValidString,
  assertValidUuid,
  createAssertValidObject,
  createAssertValidUuid
} from '@honesty-store/service/lib/assert';

const fixedTopupAmount = 500; // £5

const stripeTest = stripeFactory(process.env.TEST_STRIPE_KEY);
const stripeProd = stripeFactory(process.env.LIVE_STRIPE_KEY);

const { create, read, reduce } = cruftDDB<TopupAccount>({
  tableName: process.env.TABLE_NAME,
  limit: 100
});

const assertValidAccountId = createAssertValidUuid('accountId');
const assertValidUserId = createAssertValidUuid('userId');

const assertValidStripeDetails = ({ id, stripe }: TopupAccount) => {
  const validator = createAssertValidObject<Stripe>({
    customer: assertObject,
    nextChargeToken: assertValidUuid
  });
  try {
    validator(stripe);
  } catch (_) {
    throw new CodedError('NoCardDetailsPresent', `No stripe details registered for account ${id}`);
  }
};

const assertValidTopupAmount = (amount) => {
  switch (amount) {
    case fixedTopupAmount:
    case 0:
      break;
    default:
      throw new Error(`topup amount must be £0 or £${fixedTopupAmount / 100}`);
  }
};

const extractCardDetails = (topupAccount: TopupAccount): CardDetails => {
  assertValidStripeDetails(topupAccount);
  const { brand, exp_month, exp_year, last4 } = topupAccount.stripe.customer.sources.data[0];
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

const reducer = reduce<TopupEvent>(
  event => {
    switch (event.type) {
      case 'topup-card-details-change':
      case 'topup-attempt':
        return event.accountId;
      default:
        return assertNever(event);
    }
  },
  event => event.id,
  async (topupAccount, event, _emit) => {
    const key = createServiceKey({ service: 'topup' });

    switch (event.type) {
      case 'topup-card-details-change': {
        const { stripeToken } = event;
        const { id, stripe, stripeHistory: previousStripeHistory } = topupAccount;

        const description = stripe == null ?
          `registration for ${id}` : `adding new card for ${id}`;

        const stripeHistory = stripe == null ?
          [] : [...previousStripeHistory, stripe];

        const customer = await stripeForUser(topupAccount)
          .customers
          .create({
            source: stripeToken,
            description,
            metadata: {
              accountId: id
            }
          });

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

        assertValidStripeDetails(topupAccount);
        await assertBalanceWithinLimit({ key, accountId: id, amount });

        const charge = await stripeForUser(topupAccount).charges.create(
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
          lastTopup: topup.transaction
        };
      }
      default:
        return assertNever(event);
    }
  });

export const router: LambdaRouter = lambdaRouter('topup', 1);

router.post<TopupRequest, TopupResponse>(
  '/',
  async (key, { }, { accountId, userId, amount: dirtyAmount, stripeToken }) => {
    const amount = Number(dirtyAmount);

    assertValidAccountId(accountId);
    assertValidUserId(userId);
    assertPositiveInteger('amount', amount);
    assertOptional(assertValidString)('stripeToken', stripeToken);
    assertValidTopupAmount(amount);

    let topupAccount = null;

    if (stripeToken != null) {
      const event: TopupCardDetailsChanged = {
        id: uuid(),
        type: 'topup-card-details-change',
        userId,
        accountId,
        stripeToken
      };
      try {
        try {
          topupAccount = await reducer(event);
        } catch (e) {
          if (e.message !== `Key not found ${event.accountId}`) {
            throw e;
          }
          await create({
            id: accountId,
            userId,
            version: 0,
            test: false
          });
          topupAccount = await reducer(event);
        }
      } catch (e) {
        error(key, `couldn't create stripe customer`, e);
        throw userErrorFromStripeError(e);
      }
    }

    if (amount > 0) {
      const event: TopupAttempted = {
        id: uuid(),
        type: 'topup-attempt',
        userId,
        accountId,
        amount
      };
      try {
        topupAccount = await reducer(event);
      } catch (e) {
        let detail = '';
        if (e.message === 'Must provide source or customer.') {
          /* Note to future devs: this error appears to be a bug with stripe's API.
           *
           * We've correctly provided a customer, so the error seems odd. I
           * believe it's to do with the idempotency_key being incorrect, so
           * that's the first place to start looking. */
          detail = ' (from topup: or the idempotency_key has already been used)';
        }
        error(key, `couldn't create stripe charge${detail}`, e);
        throw userErrorFromStripeError(e);
      }
    }

    if (topupAccount == null) {
      throw new Error('Nothing to do, invalid request');
    }

    return {
      cardDetails: extractCardDetails(topupAccount),
      ...(topupAccount.lastTopup || {})
    };

  }
);

router.get<CardDetails>(
  '/:id/cardDetails',
  async (_key, { id }) => {
    assertValidAccountId(id);
    return extractCardDetails(await read(id));
  }
);

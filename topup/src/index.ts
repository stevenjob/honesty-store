import cruftDDB, { EnhancedItem } from '@honesty-store/cruft';
import { CodedError } from '@honesty-store/service/lib/error';
import { Key } from '@honesty-store/service/lib/key';
import { lambdaRouter, LambdaRouter } from '@honesty-store/service/lib/lambdaRouter';
import { error, info } from '@honesty-store/service/lib/log';
import { assertBalanceWithinLimit, createTransaction } from '@honesty-store/transaction';
import { config } from 'aws-sdk';
import * as stripeFactory from 'stripe';
import { v4 as uuid } from 'uuid';
import { userErrorFromStripeError } from './errors';

import { CardDetails, Stripe, TopupAccount, TopupRequest, TopupResponse } from './client';

import {
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

config.region = process.env.AWS_REGION;

const { create, read, update } = cruftDDB<TopupAccount>({
  tableName: process.env.TABLE_NAME,
  limit: 100
});

const assertValidAccountId = createAssertValidUuid('accountId');
const assertValidUserId = createAssertValidUuid('userId');

const stripeForUser = ({ test }) => {
  return test ? stripeTest : stripeProd;
};

const getOrCreate = async ({ key, accountId, userId }): Promise<EnhancedItem<TopupAccount>> => {
  assertValidAccountId(accountId);
  assertValidUserId(userId);

  try {
    return await read(accountId);
  } catch (e) {
    if (e.message !== `Key not found ${accountId}`) {
      throw e;
    }

    info(key, 'TopupAccount lookup failed, creating account', e);
    return create({
      id: accountId,
      userId,
      version: 0,
      test: false
    });
  }
};

const extractCardDetails = (topupAccount: TopupAccount): CardDetails => {
  const { brand, exp_month, exp_year, last4 } = topupAccount.stripe.customer.sources.data[0];
  return {
    brand,
    expMonth: exp_month,
    expYear: exp_year,
    last4
  };
};

const assertValidStripeDetails = (topupAccount: TopupAccount) => {
  const validator = createAssertValidObject<Stripe>({
    customer: assertObject,
    nextChargeToken: assertValidUuid
  });

  if (topupAccount.stripe[0]) {
    try {
      validator(topupAccount.stripe[0]);
    } catch (_) {
      throw new CodedError(
        'NoCardDetailsPresent',
        `No stripe details registered for ${topupAccount.test ? 'test ' : ''}account ${topupAccount.id}`);
    }
  }
};

const topupExistingAccount = async (key, topupAccount: EnhancedItem<TopupAccount>, amount: number) => {
  assertValidStripeDetails(topupAccount);

  await assertBalanceWithinLimit({ key, accountId: topupAccount.id, amount });

  let charge = null;

  try {
    charge = await stripeForUser(topupAccount).charges.create(
      {
        amount,
        currency: 'gbp',
        customer: topupAccount.stripe.customer.id,
        description: `topup for ${topupAccount.id}`,
        metadata: {
          accountId: topupAccount.id
        },
        expand: ['balance_transaction']
      },
      {
        idempotency_key: topupAccount.stripe.nextChargeToken
      }
    );
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

    error(key, `couldn\'t create stripe charge${detail}`, e);

    throw userErrorFromStripeError(e);
  }

  const transactionBody = await createTransaction(key, topupAccount.id, {
    type: 'topup',
    amount,
    data: {
      stripeFee: String(charge.balance_transaction.fee),
      chargeId: String(charge.id),
      topupCustomerId: topupAccount.stripe.customer.id
    }
  });

  topupAccount.stripe.nextChargeToken = uuid();
  await update(topupAccount);

  return {
    ...transactionBody,
    cardDetails: extractCardDetails(topupAccount)
  };
};

const generateStripeCustomerFromStripeToken = async (
  key, topupAccount: EnhancedItem<TopupAccount>, stripeToken
): Promise<EnhancedItem<TopupAccount>> => {
  const { id, stripe, stripeHistory: previousStripeHistory, ...other } = topupAccount;

  const description = stripe == null ?
    `registration for ${id}` : `adding new card for ${id}`;

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
    error(key, `couldn\'t create stripe customer`, { e, topupAccount });

    throw userErrorFromStripeError(e);
  }

  return await update({
    id,
    ...other,
    stripe: {
      customer,
      nextChargeToken: uuid()
    },
    stripeHistory
  });
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

const attemptTopup = async (
  { key, accountId, userId, amount, stripeToken }: TopupRequest & { key: Key }
): Promise<TopupResponse> => {
  assertValidTopupAmount(amount);

  let topupAccount = await getOrCreate({ key, accountId, userId });

  if (stripeToken) {
    topupAccount = await generateStripeCustomerFromStripeToken(key, topupAccount, stripeToken);
  }

  return amount
    ? topupExistingAccount(key, topupAccount, amount)
    : { cardDetails: extractCardDetails(topupAccount) };
};

const getCardDetails = async (id) => {
  const topupAccount: TopupAccount = await read(id);
  assertValidStripeDetails(topupAccount);
  return extractCardDetails(topupAccount);
};

export const router: LambdaRouter = lambdaRouter('topup', 1);

router.post(
  '/',
  async (key, { }, { accountId, userId, amount: dirtyAmount, stripeToken }) => {
    const amount = Number(dirtyAmount);

    assertValidAccountId(accountId);
    assertValidUserId(userId);
    assertPositiveInteger('amount', amount);
    assertOptional(assertValidString)('stripeToken', stripeToken);

    return await attemptTopup({ key, accountId, userId, amount, stripeToken });
  }
);

router.get(
  '/:id/cardDetails',
  async (_key, { id }) => {
    assertValidAccountId(id);
    return await getCardDetails(id);
  }
);

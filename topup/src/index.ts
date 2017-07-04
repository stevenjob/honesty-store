import { createAssertValidUuid } from '@honesty-store/service/lib/assert';
import { CodedError } from '@honesty-store/service/lib/error';
import { Key } from '@honesty-store/service/lib/key';
import { lambdaRouter, LambdaRouter } from '@honesty-store/service/lib/lambdaRouter';
import { error, info } from '@honesty-store/service/lib/log';
import { assertBalanceWithinLimit, createTransaction, TransactionBody } from '@honesty-store/transaction';
import { config, DynamoDB } from 'aws-sdk';
import * as stripeFactory from 'stripe';
import { v4 as uuid } from 'uuid';
import { userErrorFromStripeError } from './errors';

import { CardDetails, TopupAccount, TopupRequest } from './client/index';

import {
  assertObject,
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
const appendTopupTransaction = async ({ key, topupAccount, amount, data }
  : { key: Key, topupAccount: TopupAccount, amount: number, data: any }) => {
  const transactionBody: TransactionBody = {
    type: 'topup',
    amount,
    data: {
      ...data,
      topupAccountId: topupAccount.id,
      topupCustomerId: topupAccount.stripe.customer.id
    }
  };

  try {
    return await createTransaction(key, topupAccount.accountId, transactionBody);
  } catch (e) {
    error(key, 'couldn\'t createTransaction()', e);
    // remap error message
    throw new Error(`couldn't add transaction: ${e.message}`);
  }
};

const createStripeCharge = async ({ key, topupAccount, amount }: { key: Key, topupAccount: TopupAccount, amount: number }) => {
  try {
    return await stripeForUser(topupAccount).charges.create(
      {
        amount,
        currency: 'gbp',
        customer: topupAccount.stripe.customer.id,
        description: `topup for ${topupAccount.accountId}`,
        metadata: {
          accountId: topupAccount.accountId
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
};

const extractCardDetails = (topupAccount: TopupAccount): CardDetails => {
  const customerData = topupAccount.stripe.customer.sources.data[0];
  const { brand, exp_month, exp_year, last4 } = customerData;
  return {
    brand,
    expMonth: exp_month,
    expYear: exp_year,
    last4
  };
};

const topupExistingAccount = async ({ key, topupAccount, amount }: { key: Key, topupAccount: TopupAccount, amount: number }) => {
  assertValidStripeDetails(topupAccount);

  await assertBalanceWithinLimit({ key, accountId: topupAccount.accountId, amount });

  const charge = await createStripeCharge({ key, topupAccount, amount });

  const transactionBody = await appendTopupTransaction({
    key,
    amount,
    topupAccount,
    data: {
      stripeFee: String(charge.balance_transaction.fee),
      chargeId: String(charge.id)
    }
  });

  topupAccount.stripe.nextChargeToken = uuid();
  await update({ topupAccount });

  return {
    ...transactionBody,
    cardDetails: extractCardDetails(topupAccount)
  };
};

const recordCustomerDetails = async ({ customer, topupAccount }): Promise<TopupAccount> => {
  const newAccount = {
    ...topupAccount,
    stripe: {
      customer,
      nextChargeToken: uuid()
    }
  };

  return update({ topupAccount: newAccount });
};

const createAndRecordCustomerDetails = async ({ key, topupAccount, stripeToken, description }): Promise<TopupAccount> => {
  let customer;

  try {
    customer = await stripeForUser(topupAccount)
      .customers
      .create({
        source: stripeToken,
        description,
        metadata: {
          accountId: topupAccount.accountId
        }
      });
  } catch (e) {
    error(key, `couldn\'t create stripe customer`, { e, topupAccount });

    throw userErrorFromStripeError(e);
  }

  return await recordCustomerDetails({ customer, topupAccount });
};

const addStripeTokenToAccount = async ({ key, topupAccount, stripeToken }): Promise<TopupAccount> => {
  const description = `registration for ${topupAccount.accountId}`;
  return await createAndRecordCustomerDetails({ key, topupAccount, stripeToken, description });
};

const updateStripeTokenForAccount = async ({ key, topupAccount, stripeToken }): Promise<TopupAccount> => {
  const previousStripeDetails = topupAccount.stripe;
  const stripeHistory = topupAccount.stripeHistory || [];
  const updatedTopupAccount: TopupAccount = {
    ...topupAccount,
    stripeHistory: [...stripeHistory, previousStripeDetails]
  };

  const description = `adding new card for ${updatedTopupAccount.accountId}`;
  return await createAndRecordCustomerDetails({ key, topupAccount: updatedTopupAccount, stripeToken, description });
};

const assertValidTopupAmount = (amount) => {
  if (amount !== fixedTopupAmount) {
    throw new Error(`topup amount must be £${fixedTopupAmount / 100}`);
  }
};

const attemptTopup = async ({ key, accountId, userId, amount, stripeToken }: TopupRequest & { key: Key }) => {
  assertValidTopupAmount(amount);

  let topupAccount = await getOrCreate({ key, accountId, userId });

  if (stripeToken) {
    const topupDetails = { key, topupAccount, stripeToken };
    topupAccount = topupAccount.stripe ?
      await updateStripeTokenForAccount(topupDetails) :
      await addStripeTokenToAccount(topupDetails);
  }

  return topupExistingAccount({ key, topupAccount, amount });
};

const getCardDetails = async ({ userId }) => {
  const topupAccount: TopupAccount = await get({ userId });
  assertValidStripeDetails(topupAccount);
  return extractCardDetails(topupAccount);
};

export const router: LambdaRouter = lambdaRouter('topup', 1);

router.post(
  '/',
  async (key, {}, { accountId, userId, amount, stripeToken }) =>
    attemptTopup({ key, accountId, userId, amount, stripeToken })
);

router.get(
  '/:userId/cardDetails',
  async (_key, { userId }) =>
    getCardDetails({ userId })
);

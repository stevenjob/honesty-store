import { config, DynamoDB } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import * as stripeFactory from 'stripe';
import { v4 as uuid } from 'uuid';

import { createAssertValidUuid } from '../../service/src/assert';
import { CodedError } from '../../service/src/error';
import { Key } from '../../service/src/key';
import { error, info } from '../../service/src/log';
import { serviceAuthentication, serviceRouter } from '../../service/src/router';
import { assertBalanceWithinLimit, createTransaction, TransactionBody } from '../../transaction/src/client/index';
import { CardDetails, TopupAccount, TopupRequest } from './client/index';

const fixedTopupAmount = 500; // £5

const stripeTest = stripeFactory(process.env.TEST_STRIPE_KEY);
const stripeProd = stripeFactory(process.env.LIVE_STRIPE_KEY);

config.region = process.env.AWS_REGION;

const assertValidAccountId = createAssertValidUuid('accountId');
const assertValidUserId = createAssertValidUuid('userId');

const assertValidTopupAccount = (topupAccount: TopupAccount) => {
  assertValidAccountId(topupAccount.accountId);
};

const stripeForUser = ({ test }) => {
  return test ? stripeTest : stripeProd;
};

const get = async ({ userId }): Promise<TopupAccount> => {
  assertValidUserId(userId);

  const queryResponse = await new DynamoDB.DocumentClient()
    .query({
      TableName: process.env.TABLE_NAME,
      IndexName: 'userId',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise();

  if (queryResponse.Items.length > 1) {
    throw new Error(`Too many database entries for userId '${userId}'`);
  }

  const indexItem = queryResponse.Items[0];

  if (indexItem == null) {
    throw new Error(`No topup account for ${userId}`);
  }

  const { id } = indexItem;

  const getResponse = await new DynamoDB.DocumentClient()
    .get({
      TableName: process.env.TABLE_NAME,
      Key: { id }
    })
    .promise();

  const item = <TopupAccount>getResponse.Item;

  if (item == null) {
    throw new Error(`Index lookup failed for ${userId} ${id}`);
  }

  return item;
};

const update = async ({ topupAccount }: { topupAccount: TopupAccount }) => {
  assertValidTopupAccount(topupAccount);

  await new DynamoDB.DocumentClient()
    .update({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: topupAccount.id
      },
      UpdateExpression:
      'set stripe = :stripe, accountId = :accountId, userId = :userId, created = :created, stripeHistory = :stripeHistory',
      ExpressionAttributeValues: {
        ':stripe': topupAccount.stripe || {},
        ':accountId': topupAccount.accountId,
        ':userId': topupAccount.userId,
        ':created': topupAccount.created,
        ':stripeHistory': topupAccount.stripeHistory || []
      }
    })
    .promise();

  return topupAccount;
};

const getOrCreate = async ({ key, accountId, userId }): Promise<TopupAccount> => {
  assertValidAccountId(accountId);
  assertValidUserId(userId);

  try {
    return await get({ userId });
  } catch (e) {
    info(key, 'TopupAccount lookup failed, creating account', e);
    return update({
      topupAccount: {
        id: uuid(),
        created: Date.now(),
        userId,
        accountId,
        test: false
      }
    });
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

const stripeCodeToErrorCode = (stripeCode) => {
  switch (stripeCode) {
    case 'incorrect_number':      return 'CardIncorrectNumber';
    case 'invalid_number':        return 'CardInvalidNumber';
    case 'invalid_expiry_month':  return 'CardInvalidExpiryMonth';
    case 'invalid_expiry_year':   return 'CardInvalidExpiryYear';
    case 'incorrect_cvc':         return 'CardIncorrectCVC';
    case 'invalid_cvc':           return 'CardInvalidCVC';
    case 'expired_card':          return 'CardExpired';
    case 'card_declined':         return 'CardDeclined';

    case 'incorrect_zip':
    case 'missing':
    case 'processing_error':
      // fall through
    default:
      return 'CardError';
  }
};

const userErrorFromStripeError = (stripeError) => {
  if (stripeError.type !== 'StripeCardError') {
    return stripeError;
  }

  const errorCode = stripeCodeToErrorCode(stripeError.code);
  return new CodedError(errorCode, stripeError.message);
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

const assertValidStripeDetails = (topupAccount) => {
  if (!topupAccount.stripe
  || !topupAccount.stripe.customer
  || !topupAccount.stripe.nextChargeToken) {
    // tslint:disable-next-line:max-line-length
    throw new CodedError(
      'NoCardDetailsPresent',
      `No stripe details registered for ${topupAccount.test ? 'test ' : ''}account ${topupAccount.accountId} - please provide stripeToken`);
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

const assertDynamoConnectivity = async () => {
  await new DynamoDB.DocumentClient()
    .get({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: 'non-existent-id'
      }
    })
    .promise();
};

const assertStripeConnectivity = async ({ test }) => {
  await stripeForUser({ test })
    .balance
    .retrieve();
};

const assertConnectivity = async () => {
  await assertDynamoConnectivity();
  await assertStripeConnectivity({ test: false });
  await assertStripeConnectivity({ test: true });
};

const app = express();

app.use(bodyParser.json());

const router = serviceRouter('topup', 1);

router.post(
  '/',
  serviceAuthentication,
  async (key, {}, { accountId, userId, amount, stripeToken }) =>
    attemptTopup({ key, accountId, userId, amount, stripeToken })
);

router.get(
  '/:userId/cardDetails',
  serviceAuthentication,
  async (_key, { userId }) =>
    getCardDetails({ userId })
);

app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => {
  assertConnectivity()
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500));
});

app.listen(3000);

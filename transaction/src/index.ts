import { config, DynamoDB } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');
import { serviceAuthentication, serviceRouter } from '../../service/src/router';
import { Account, balanceLimit, TEST_DATA_EMPTY_ACCOUNT_ID, Transaction, TransactionAndBalance } from './client';

config.region = process.env.AWS_REGION;

const assertValidAccountId = (accountId) => {
  if (accountId == null || !isUUID(accountId, 4)) {
    throw new Error(`Invalid accountId ${accountId}`);
  }
};

const assertValidTransaction = ({type, amount, data}: Transaction) => {
  if (type == null || (type !== 'topup' && type !== 'purchase')) {
    throw new Error(`Invalid transaction type ${type}`);
  }
  if (!Number.isInteger(amount) /* this also checks typeof amount */) {
    throw new Error(`Non-integral transaction amount ${amount}`);
  }
  if ((type === 'topup' && amount <= 0) || (type === 'purchase' && amount >= 0)) {
    throw new Error(`Invalid transaction amount for type ${amount} ${type}`);
  }
  if (data == null || typeof data !== 'object') {
    throw new Error(`Invalid transaction data ${JSON.stringify(data)}`);
  }
  for (const key of Object.keys(data)) {
    if (typeof data[key] !== 'string') {
      throw new Error(`Invalid transaction data ${JSON.stringify(data)}`);
    }
  }
};

const get = async ({ accountId }): Promise<Account> => {
  assertValidAccountId(accountId);

  const response = await new DynamoDB.DocumentClient()
    .get({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: accountId
      }
    })
    .promise();

  if (response.Item == null) {
    throw new Error(`Account not found ${accountId}`);
  }

  return <Account>response.Item;
};

const createAccount = async ({ accountId }) => {
  assertValidAccountId(accountId);

  const account: Account = {
    id: accountId,
    created: Date.now(),
    balance: 0,
    version: 0,
    transactions: []
  };

  await new DynamoDB.DocumentClient()
    .put({
      TableName: process.env.TABLE_NAME,
      Item: account
    })
    .promise();

  return account;
};

const createTransaction = async ({ accountId, type, amount, data }): Promise<TransactionAndBalance> => {
  assertValidAccountId(accountId);

  const originalAccount = await get({ accountId });

  const transaction: Transaction = {
    id: uuid(),
    timestamp: Date.now(),
    type,
    amount,
    data
  };

  assertValidTransaction(transaction);

  const updatedAccount: Account = {
    ...originalAccount,
    version: originalAccount.version + 1,
    balance: originalAccount.balance + transaction.amount,
    transactions: [transaction, ...originalAccount.transactions]
  };

  if (updatedAccount.balance < 0) {
    throw new Error(`Balance would be negative ${updatedAccount.balance}`);
  }
  if (updatedAccount.balance > balanceLimit) {
    throw new Error(`Balance would be greater than ${balanceLimit} (${updatedAccount.balance})`);
  }

  await new DynamoDB.DocumentClient()
    .update({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: accountId
      },
      ConditionExpression:
        'balance=:originalBalance and ' +
        'version = :originalVersion'
      ,
      UpdateExpression:
        'set balance=:updatedBalance,' +
        'transactions=:transactions,' +
        'version=:updatedVersion'
      ,
      ExpressionAttributeValues: {
        ':originalBalance': originalAccount.balance,
        ':updatedBalance': updatedAccount.balance,
        ':transactions': updatedAccount.transactions,
        ':originalVersion': updatedAccount.version - 1,
        ':updatedVersion': updatedAccount.version
      }
    })
    .promise();

  return {
    transaction: transaction,
    balance: updatedAccount.balance
  };
};

const app = express();

app.use(bodyParser.json());

const router = serviceRouter('transaction', 1);

router.get(
  '/:accountId',
  serviceAuthentication,
  async (_key, { accountId }) => await get({ accountId })
);

router.post(
  '/:accountId',
  serviceAuthentication,
  async (_key, { accountId }, { type, amount, data }) =>
    await createTransaction({ accountId, type, amount, data })
);

router.post(
  '/',
  serviceAuthentication,
  async (_key, {}, { accountId }) => await createAccount({ accountId })
);

app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => {
  get({ accountId: TEST_DATA_EMPTY_ACCOUNT_ID })
    .then(() => {
      res.sendStatus(200);
    })
    .catch(() => {
      res.sendStatus(500);
    });
});

app.listen(3000);

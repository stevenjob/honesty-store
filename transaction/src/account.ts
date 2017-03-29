import { DynamoDB } from 'aws-sdk';
import isUUID = require('validator/lib/isUUID');

import { Account, TransactionList } from './client';

export type InternalAccount = Account & { transactionHead?: string } & { cachedTransactions: TransactionList; };

export const assertValidAccountId = (accountId) => {
  if (accountId == null || !isUUID(accountId, 4)) {
    throw new Error(`Invalid accountId ${accountId}`);
  }
};

export const getAccountInternal = async ({ accountId }): Promise<InternalAccount> => {
  assertValidAccountId(accountId);

  const accountResponse = await new DynamoDB.DocumentClient()
    .get({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: accountId
      }
    })
    .promise();

  const { Item: item } = accountResponse;

  if (item == null) {
    throw new Error(`Account not found ${accountId}`);
  }

  return <InternalAccount>item;
};

export const createAccount = async ({ accountId }): Promise<InternalAccount> => {
  assertValidAccountId(accountId);

  const account: InternalAccount = {
    id: accountId,
    created: Date.now(),
    balance: 0,
    cachedTransactions: []
  };

  await new DynamoDB.DocumentClient()
    .put({
      TableName: process.env.TABLE_NAME,
      Item: account
    })
    .promise();

  return account;
};

export const updateAccount = async ({ updatedAccount, originalAccount }: { updatedAccount: InternalAccount, originalAccount: InternalAccount }) => {
  assertValidAccountId(updatedAccount.id);
  if (updatedAccount.id !== originalAccount.id) {
    throw new Error(`mismatching account ids for update (${updatedAccount.id} vs ${originalAccount.id})`);
  }

  await new DynamoDB.DocumentClient()
    .update({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: updatedAccount.id
      },
      ConditionExpression: 'balance=:originalBalance and (transactionHead = :originalTransaction or not attribute_exists(transactionHead))',
      UpdateExpression: 'set balance=:updatedBalance, transactionHead=:updatedTransaction',
      ExpressionAttributeValues: {
        ':originalBalance': originalAccount.balance,
        ':updatedBalance': updatedAccount.balance,
        ':originalTransaction': originalAccount.transactionHead || null,
        ':updatedTransaction': updatedAccount.transactionHead
      }
    })
    .promise();
};

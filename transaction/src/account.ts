import { DynamoDB } from 'aws-sdk';
import isUUID = require('validator/lib/isUUID');

import { InternalAccount } from './client';

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
    version: 0,
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

export const updateAccount = async (
  { updatedAccount, originalAccount }: { updatedAccount: InternalAccount, originalAccount: InternalAccount }
) => {
  assertValidAccountId(updatedAccount.id);
  if (updatedAccount.id !== originalAccount.id) {
    throw new Error(`mismatching account ids for update (${updatedAccount.id} vs ${originalAccount.id})`);
  }
  if (updatedAccount.version !== originalAccount.version + 1) {
    throw new Error(`wrong increment for updated account version (${updatedAccount.version} vs ${originalAccount.version})`);
  }

  await new DynamoDB.DocumentClient()
    .update({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: updatedAccount.id
      },
      ConditionExpression:
        'balance=:originalBalance and ' +
        'version = :originalVersion'
      ,
      UpdateExpression:
        'set balance=:updatedBalance,' +
        'transactionHead=:updatedHead,' +
        'version=:updatedVersion,' +
        'cachedTransactions=:cachedTransactions'
      ,
      ExpressionAttributeValues: {
        ':originalVersion': originalAccount.version,
        ':updatedVersion': updatedAccount.version,
        ':originalBalance': originalAccount.balance,
        ':updatedBalance': updatedAccount.balance,
        ':updatedHead': updatedAccount.transactionHead || null,
        ':cachedTransactions': updatedAccount.cachedTransactions
      }
    })
    .promise();
};

import { DynamoDB } from 'aws-sdk';
import isUUID = require('validator/lib/isUUID');

import { Account } from './client';

export type DBAccount = Account & { latestTx?: string };

export const assertValidAccountId = (accountId) => {
  if (accountId == null || !isUUID(accountId, 4)) {
    throw new Error(`Invalid accountId ${accountId}`);
  }
};

const assertValidDBAccount = (account) => {
  if (account.balance === undefined
  || account.created === undefined) {
    throw new Error(`ID ${account.id} references a transaction, not a [tx]account`);
  }
};

export const getAccountInternal = async ({ accountId }): Promise<DBAccount> => {
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
  assertValidDBAccount(item);

  return <DBAccount>item;
};

export const createAccount = async ({ accountId }) => {
  assertValidAccountId(accountId);

  const account: Account = {
    id: accountId,
    created: Date.now(),
    balance: 0,
    version: 0
  };

  await new DynamoDB.DocumentClient()
    .put({
      TableName: process.env.TABLE_NAME,
      Item: account
    })
    .promise();

  return account;
};

export const updateAccount = async ({ updatedAccount, originalAccount }: { updatedAccount: DBAccount, originalAccount: DBAccount }) => {
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
        'latestTx=:updatedTx,' +
        'version=:updatedVersion'
      ,
      ExpressionAttributeValues: {
        ':originalVersion': originalAccount.version,
        ':updatedVersion': updatedAccount.version,
        ':originalBalance': originalAccount.balance,
        ':updatedBalance': updatedAccount.balance,
        ':updatedTx': updatedAccount.latestTx
      }
    })
    .promise();
};

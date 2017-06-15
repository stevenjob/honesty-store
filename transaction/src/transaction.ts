import { DynamoDB } from 'aws-sdk';
import { createHash } from 'crypto';
import stringify = require('json-stable-stringify');

import { assertValidTransaction, assertValidTransactionId, Transaction, TransactionDetails } from './client';

import { migrateStoreCodeToId } from '@honesty-store/service/lib/store';

export const createTransactionId = ({ accountId, transactionId }) => `${accountId}:${transactionId}`;

export const hashTransaction = (transaction: TransactionDetails) => {
  const hash = createHash('sha256');

  hash.update(stringify(transaction));

  return hash.digest('hex');
};

const externalisePurchaseTransactionData = (data) => {
  const { storeId: existingStoreId } = data;

  if (existingStoreId == null) {
    return data;
  }

  return {
    ...data,
    storeId: migrateStoreCodeToId(existingStoreId)
  };
};

export const getTransaction = async (id) => {
  assertValidTransactionId(id);
  const response = await new DynamoDB.DocumentClient()
    .get({
      TableName: process.env.TABLE_NAME,
      Key: { id }
    })
    .promise();

  const { Item: item } = response;
  if (item == null) {
    throw new Error(`Transaction not found ${id}`);
  }

  const transaction = <Transaction>item;

  if (transaction.type === 'purchase') {
    return {
      ...transaction,
      data: externalisePurchaseTransactionData(transaction.data)
    };
  }
  return transaction;
};

// tslint:disable-next-line:no-function-expression
export const walkTransactions = async function* (transactionId: string): AsyncIterableIterator<Transaction> {
  const transaction = await getTransaction(transactionId);
  yield transaction;
  if (transaction.next != null) {
    yield* walkTransactions(transaction.next);
  }
};

export const getTransactions = async ({ transactionId, limit = Infinity }): Promise<Transaction[]> => {
  const transactions: Transaction[] = [];
  for await (const transaction of walkTransactions(transactionId)) {
    if (transactions.length >= limit) {
      break;
    }
    transactions.push(transaction);
  }
  return transactions;
};

export const putTransaction = async (transaction: Transaction) => {
  assertValidTransaction(transaction);

  await new DynamoDB.DocumentClient()
    .put({
      TableName: process.env.TABLE_NAME,
      Item: transaction
    })
    .promise();
};

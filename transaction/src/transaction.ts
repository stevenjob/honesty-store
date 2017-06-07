import { DynamoDB } from 'aws-sdk';
import { createHash } from 'crypto';
import stringify = require('json-stable-stringify');
import isUUID = require('validator/lib/isUUID');

import { createAssertValidUuid } from '@honesty-store/service/src/assert';
import { migrateStoreCodeToId } from '@honesty-store/store/src/client';

import { Transaction, TransactionDetails } from './client';

const isSHA256 = (hash) => /^[a-f0-9]{64}$/.test(hash);

export const extractFieldsFromTransactionId = (id: string) => {
  const [, accountId, transactionId, ...rest] = /(.*):(.*)/.exec(id);

  return {
    accountId,
    transactionId,
    ...rest
  };
};

const assertValidTransactionId = (id) => {
  const { accountId, transactionId, ...rest } = extractFieldsFromTransactionId(id);

  if (rest.length) {
    throw new Error(`Transaction id isn't <accountId>:<transactionHash> (${id})`);
  }

  if (!isUUID(accountId)) {
    throw new Error(`Transaction id's accountId isn't a uuid (${accountId})`);
  }

  if (!isSHA256(transactionId)) {
    throw new Error(`Transaction hash isn't a SHA256 hash (${transactionId})`);
  }
};

export const createTransactionId = ({ accountId, transactionId }) => `${accountId}:${transactionId}`;

export const hashTransaction = (transaction: TransactionDetails) => {
  const hash = createHash('sha256');

  hash.update(stringify(transaction));

  return hash.digest('hex');
};

const assertValidLegacyId = createAssertValidUuid('legacyId');

export const assertValidTransaction = ({ type, amount, data, id, other, next, legacyId, timestamp, ...rest }: Transaction) => {
  assertValidTransactionId(id);
  if (type == null || (type !== 'topup' && type !== 'purchase' && type !== 'refund')) {
    throw new Error(`Invalid transaction type ${type}`);
  }
  if (!Number.isInteger(amount) /* this also checks typeof amount */) {
    throw new Error(`Non-integral transaction amount ${amount}`);
  }
  if (((type === 'topup' || type === 'refund') && amount <= 0) || (type === 'purchase' && amount >= 0)) {
    throw new Error(`Invalid transaction amount for type '${type}': ${amount}`);
  }
  if (data == null || typeof data !== 'object') {
    throw new Error(`Invalid transaction data ${JSON.stringify(data)}`);
  }
  for (const key of Object.keys(data)) {
    if (typeof data[key] !== 'string') {
      throw new Error(`Invalid transaction data ${JSON.stringify(data)}`);
    }
  }
  if (other != null) {
    assertValidTransactionId(other);
  }
  if (next != null) {
    assertValidTransactionId(next);
  }
  if (legacyId != null) {
    assertValidLegacyId(legacyId);
  }
  if (!Number.isInteger(timestamp)) {
    throw new Error(`Non-integral timestamp ${timestamp}`);
  }
  if (Object.keys(rest).length !== 0) {
    throw new Error('Invalid transaction properties supplied');
  }
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
export const walkTransactions = async function*(transactionId: string): AsyncIterableIterator<Transaction> {
  const transaction = await getTransaction(transactionId);
  yield transaction;
  yield* walkTransactions(transaction.next);
};

export const getTransactions = async ({ transactionId, limit = Infinity }): Promise<Transaction[]> => {
  const transactions = [];
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

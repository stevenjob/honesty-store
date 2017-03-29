import { createHash } from 'crypto';

import { DynamoDB } from 'aws-sdk';
import stringify = require('json-stable-stringify');

import { Transaction, TransactionBody } from './client';

type TransactionChain = Transaction & { next?: TransactionChain };
type DBTransaction = Transaction & { next?: string };

export const assertValidTransaction = ({ type, amount, data }: Transaction) => {
  if (type == null || (type !== 'topup' && type !== 'purchase')) {
    throw new Error(`Invalid transaction type ${type}`);
  }
  if (!Number.isInteger(amount) /* this also checks typeof amount */) {
    throw new Error(`Non-integral transaction amount ${amount}`);
  }
  if ((type === 'topup' && amount <= 0) || (type === 'purchase' && amount >= 0)) {
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
};

export const hashTransaction = (transaction: TransactionBody & { next?: string }) => {
  const hash = createHash('sha256');

  hash.update(stringify(transaction));

  return hash.digest('hex');
};

export const createTransactionId = ({ accountId, transactionId }) => `${accountId}:${transactionId}`;

const getTransaction = async (id) => {
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

  return <DBTransaction>item;
};

const getTransactionChain = async ({ transactionId, limit = Infinity }): Promise<TransactionChain> => {
  if (!transactionId) {
    return undefined;
  }
  if (limit <= 0) {
    return undefined;
  }

  const transaction = await getTransaction(transactionId);

  return {
    ...transaction,
    next: await getTransactionChain({ transactionId: transaction.next, limit: limit - 1 })
  };
};

const transactionChainToArray = (chain) => {
  const transactions = [];
  for (let transaction = chain; transaction; transaction = transaction.next) {
    // tslint:disable-next-line:no-unused-variable
    const { next, ...externalisedTransaction } = transaction;
    transactions.push(externalisedTransaction);
  }
  return transactions;
};

export const getTransactions = async ({ transactionId, limit = Infinity }) => {
  const chain = await getTransactionChain({ transactionId, limit });
  return transactionChainToArray(chain);
};

export const putTransaction = async (transaction: DBTransaction) => {
  assertValidTransaction(transaction);

  await new DynamoDB.DocumentClient()
    .put({
      TableName: process.env.TABLE_NAME,
      Item: transaction
    })
    .promise();
};

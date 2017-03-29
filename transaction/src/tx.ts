import { createHash } from 'crypto';
import { DynamoDB } from 'aws-sdk';
import stringify = require('json-stable-stringify');

import { assertValidAccountId } from './account';
import { Transaction, TransactionBody } from './client';

type LinkedTransaction = Transaction & { next?: LinkedTransaction };
export type DBTransaction = Transaction & { next?: string };

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

export const hashTransaction = (tx: TransactionBody & { next?: string }) => {
  const hash = createHash('sha256');

  hash.update(stringify(tx));

  return hash.digest('hex');
};

export const createTransactionId = ({ accountId, txId }) => `${accountId}:${txId}`;

const getTransaction = async ({ accountId, txId }) => {
  assertValidAccountId(accountId);

  const id = createTransactionId({ accountId, txId });

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

export const getTransactionChain = async ({ accountId, txId, limit = Infinity }): Promise<LinkedTransaction> => {
  if (!txId) {
    return undefined;
  }
  if (limit === 0) {
    return undefined;
  }

  const tx = await getTransaction({ accountId, txId });

  return {
    ...tx,
    next: await getTransactionChain({ accountId, txId: tx.next, limit: limit - 1 })
  };
};

export const putTransaction = async (tx: DBTransaction) => {
  await new DynamoDB.DocumentClient()
    .put({
      TableName: process.env.TABLE_NAME,
      Item: tx
    })
    .promise();
};

import { DynamoDB } from 'aws-sdk';
import isUUID = require('validator/lib/isUUID');

import { Transaction } from './client';

type LinkedTransaction = Transaction & { next?: LinkedTransaction };
export type DBTransaction = Transaction & { next?: string };

const assertValidTransactionId = (txId) => {
  if (txId == null || !isUUID(txId, 4)) {
    throw new Error(`Invalid transactionId ${txId}`);
  }
};

export const assertValidTransaction = ({ type, amount, data }: Transaction) => {
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

const getTransaction = async (id) => {
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
  try {
    assertValidTransaction(<Transaction>item);
  } catch (_) {
    throw new Error(`ID ${id} references an account, not a transaction`);
  }

  return <DBTransaction>item;
};

export const getTransactionChain = async (txId): Promise<LinkedTransaction> => {
  if (!txId) {
    return undefined;
  }

  const tx = await getTransaction(txId);

  return {
    ...tx,
    next: await getTransactionChain(tx.next)
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

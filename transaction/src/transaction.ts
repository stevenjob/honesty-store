import { createHash } from 'crypto';

import { DynamoDB } from 'aws-sdk';
import stringify = require('json-stable-stringify');
import isUUID = require('validator/lib/isUUID');

import { InternalTransaction, Transaction, TransactionDetails } from './client';

const isSHA256 = (hash) => /^[a-f0-9]{64}$/.test(hash);

const assertValidTransactionId = (id) => {
  const [, accountId, transactionId, ...rest] = /(.*):(.*)/.exec(id);

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

export const assertValidTransaction = ({ type, amount, data, id }: Transaction) => {
  assertValidTransactionId(id);
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

const externalisePurchaseTransactionData = (data) => {
  const { storeId: existingStoreId } = data;

  if (existingStoreId == null || isUUID(existingStoreId)) {
    return data;
  }

  const legacyStoreCodeToId = {
    'sl-edn': 'f79ff70c-2103-43f9-922d-d54a16315361',
    'sl-ncl': 'b8d7305b-bb7d-4bbe-8b2f-5e94c6267bb6',
    'sl-ldn': '1cfb21d8-52d8-4eee-98ce-740c466bfc0e',
    'sl-brs': '9a61dad3-f05c-46aa-a7e4-14311e9cccc5',
    'dev-test': '1e7c9c0d-a9be-4ab7-8499-e57bf859978d'
  };
  const updatedStoreId = legacyStoreCodeToId[existingStoreId];
  if (updatedStoreId == null) {
    throw new Error(`Unexpected legacy storeId found: ${existingStoreId}`);
  }
  return {
    ...data,
    storeId: updatedStoreId
  };
};

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

  const transaction = <InternalTransaction>item;

  if (transaction.type === 'purchase') {
    return {
      ...transaction,
      data: externalisePurchaseTransactionData(transaction.data)
    };
  }
  return transaction;
};

export const getTransactions = async ({ transactionId, limit = Infinity }): Promise<Transaction[]> => {
  if (limit <= 0) {
    return [];
  }

  const transaction = await getTransaction(transactionId);

  return [
    transaction,
    ...await getTransactions({ transactionId: transaction.next, limit: limit - 1 })
  ];
};

export const putTransaction = async (transaction: InternalTransaction) => {
  assertValidTransaction(transaction);

  await new DynamoDB.DocumentClient()
    .put({
      TableName: process.env.TABLE_NAME,
      Item: transaction
    })
    .promise();
};

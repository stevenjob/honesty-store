import isUUID = require('validator/lib/isUUID');

import { createAssertValidUuid } from '@honesty-store/service/src/assert';
import { CodedError } from '@honesty-store/service/src/error';
import fetch from '@honesty-store/service/src/fetch';

const isSHA256 = (hash) => /^[a-f0-9]{64}$/.test(hash);

export const extractFieldsFromTransactionId = (id: string) => {
  const [, accountId, transactionId, ...rest] = /(.*):(.*)/.exec(id) || [];

  return {
    accountId,
    transactionId,
    rest
  };
};

export const assertValidTransactionId = (id) => {
  const { accountId, transactionId, rest } = extractFieldsFromTransactionId(id);

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
export const balanceLimit = 1000; // £10

export type TransactionType = 'topup' | 'purchase' | 'refund';
export const transactionTypes = ['topup', 'purchase', 'refund'];

// supplied to transaction service from external service
export interface TransactionBody {
  type: TransactionType;
  amount: number;
  data: {
    [key: string]: string;
  };
  other?: string;
}

// internally used to create a hash of the transaction
export interface TransactionDetails extends TransactionBody {
  timestamp: number;
  next?: string;
  legacyId?: string;
}

// as retrieved from database
export interface Transaction extends TransactionDetails {
  id: string;
}

export interface Account {
  id: string;
  created: number;
  balance: number;
  version: number;
}

export type InternalAccount = Account & { transactionHead?: string } & { cachedTransactions: TransactionList; };

export type TransactionList = Transaction[];

export type AccountAndTransactions = Account & { transactions: TransactionList };

export interface TransactionAndBalance {
  transaction: Transaction;
  balance: number;
}

const { get, post } = fetch('transaction');

export const createAccount = (key, accountId: string) =>
  post<AccountAndTransactions>(1, key, '/account', { accountId });

export const getAccount = (key, accountId: string) =>
  get<AccountAndTransactions>(1, key, `/account/${accountId}`);

export const createTransaction = (key, accountId: string, transaction: TransactionBody) =>
  post<TransactionAndBalance>(1, key, `/account/${accountId}`, transaction);

export const getTransaction = (key, transactionId: string) =>
  get<Transaction>(1, key, `/tx/${transactionId}`);

export const issueUserRequestedRefund = (key, transactionId: string, userId: string, reason: string) =>
  post<TransactionAndBalance>(1, key, `/tx/${transactionId}/refund/user`, { userId, reason });

export const issueSupportRequestedRefund = (key, transactionId: string, reason: string, dateLimit: number) =>
  post<TransactionAndBalance>(1, key, `/tx/${transactionId}/refund/support`, { dateLimit, reason });

export const assertBalanceWithinLimit = async ({ key, accountId, amount }) => {
  const currentBalance = (await getAccount(key, accountId)).balance;

  // The rhs of the OR expression will never be reached, but is instead used to qualify the type of 'amount'
  if (!Number.isFinite(amount) || typeof amount !== 'number') {
    throw new Error('amount is not a number');
  }

  if (currentBalance + amount > balanceLimit) {
    throw new CodedError(
      'TopupExceedsMaxBalance',
      `topping up would increase balance over the limit of £${balanceLimit / 100}`);
  }
};

export const TEST_DATA_EMPTY_ACCOUNT_ID = 'b423607f-64de-441f-ac39-12d50aaedbe9';

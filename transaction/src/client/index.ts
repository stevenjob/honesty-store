import { CodedError } from '../../../service/src/error';
import fetch from '../../../service/src/fetch';

export const balanceLimit = 1000; // £10

export interface TransactionDetails {
  type: 'topup' | 'purchase';
  amount: number;
  data: {
    [key: string]: string;
  };
  legacyId?: string;
}

export interface TransactionBody extends TransactionDetails {
  timestamp: number;
}

export interface Transaction extends TransactionBody {
  id: string;
}

export interface Account {
  id: string;
  created: number;
  balance: number;
  version: number;
}

export type TransactionList = Transaction[];

export type AccountAndTxs = Account & { transactions: TransactionList };

export interface TransactionAndBalance {
  transaction: Transaction;
  balance: number;
}

const { get, post } = fetch('transaction');

export const createAccount = (key, accountId: string) =>
  post<AccountAndTxs>(1, key, '/', { accountId });

export const getAccount = (key, accountId: string) =>
  get<AccountAndTxs>(1, key, `/${accountId}`);

export const createTransaction = (key, accountId: string, transaction: TransactionDetails) =>
  post<TransactionAndBalance>(1, key, `/${accountId}`, transaction);

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

import fetch from '../../../service/src/fetch';

export const balanceLimit = 1000; // £10

export interface TransactionDetails {
    type: 'topup' | 'purchase';
    amount: number;
    data: {
        [key: string]: string;
    }
}

export interface Transaction extends TransactionDetails {
    id: string;
}

export interface Account {
    id: string;
    balance: number;
    transactions: Transaction[];
}

export interface TransactionAndBalance {
    transaction: TransactionDetails;
    balance: number;
};

const { get, post } = fetch('transaction');

export const createAccount = (key, accountId: string) =>
    post<Account>(1, key, `/`, { accountId });

export const getAccount = (key, accountId: string) =>
    get<Account>(1, key, `/${accountId}`);

export const createTransaction = (key, accountId: string, transaction: TransactionDetails) =>
    post<TransactionAndBalance>(1, key, `/${accountId}`, transaction);

export const assertBalanceWithinLimit = async ({ key, accountId, amount }) => {
    const currentBalance = (await getAccount(key, accountId)).balance;

    if (currentBalance + amount > balanceLimit) {
        throw new Error(`topping up would increase balance over the limit of £${balanceLimit / 100}`);
    }
};

export const TEST_DATA_EMPTY_ACCOUNT_ID = 'b423607f-64de-441f-ac39-12d50aaedbe9';

import fetch from 'node-fetch';

import { ApiResponse } from '../../../shared/types';

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

const baseUrl = process.env.BASE_URL;

export const createAccount = async (accountId: string): Promise<Account> => {
    const response = await fetch(`${baseUrl}/transaction/v1/`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ accountId })
    })
        .then<ApiResponse<Account>>(response => response.json());
    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.response;
};

export const getAccount = async (accountId: string): Promise<Account> => {
    const response = await fetch(`${baseUrl}/transaction/v1/${accountId}`)
        .then<ApiResponse<Account>>(response => response.json());
    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.response;
};

export const createTransaction = async (accountId: string, transaction: TransactionDetails): Promise<TransactionAndBalance> => {
    const response = await fetch(`${baseUrl}/transaction/v1/${accountId}`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(transaction)
    })
        .then<ApiResponse<TransactionAndBalance>>(response => response.json());
    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.response;
};

export const TEST_DATA_EMPTY_ACCOUNT_ID = 'b423607f-64de-441f-ac39-12d50aaedbe9';
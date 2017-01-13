import fetch from 'node-fetch';
import { ApiResponse } from '../../../shared/types';
import { TransactionAndBalance } from '../../../transaction/src/client/index';

export interface TopupAccount {
    id: string;
    accountId: string;
    userId: string;
    test: boolean;

    stripe?: {
        customer: any;
        nextChargeToken: string;
    };
};

export interface TopupRequest {
    accountId: string;
    userId: string;
    amount: number;
    stripeToken: string;
};

const baseUrl = process.env.BASE_URL;

export const createTopup = async (request: TopupRequest): Promise<TransactionAndBalance> => {
    const response = await fetch(`${baseUrl}/topup/v1/`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(request)
    })
        .then<ApiResponse<TransactionAndBalanceAccount>>(response => response.json());

    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.response;
};

import fetch from 'node-fetch';
import { ApiResponse } from '../../../service/types';
import { TransactionAndBalance } from '../../../transaction/src/client/index';
import { baseUrl } from '../../../service/baseUrl';

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

export const createTopup = async (request: TopupRequest): Promise<TransactionAndBalance> => {
    const response = await fetch(`${baseUrl}/topup/v1/topup`, {
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

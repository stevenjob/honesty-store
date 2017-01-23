import { TransactionAndBalance } from '../../../transaction/src/client/index';
import fetch from '../../../service/src/fetch';

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

const { post } = fetch('topup');

export const createTopup = (key, request: TopupRequest) =>
    post<TransactionAndBalance>(1, key, `/`, request);

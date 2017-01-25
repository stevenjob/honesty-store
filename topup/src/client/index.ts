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

export interface CardDetails {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
}

export type TopupResponse = {
    cardDetails: CardDetails;
} & TransactionAndBalance;

const { get, post } = fetch('topup');

export const createTopup = (key, request: TopupRequest) =>
    post<TopupResponse>(1, key, `/`, request);

export const getCardDetails = (key, userId: string) =>
    get<CardDetails>(1, key, `/${userId}/cardDetails`);

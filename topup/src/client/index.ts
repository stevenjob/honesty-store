import fetch from '../../../service/src/fetch';
import { TransactionAndBalance } from '../../../transaction/src/client/index';

interface Stripe {
  customer: any;
  nextChargeToken: string;
}

export interface TopupAccount {
  id: string;
  created: number;
  accountId: string;
  userId: string;
  test: boolean;

  stripe?: Stripe;
  stripeHistory?: Stripe[];
}

export interface TopupRequest {
  accountId: string;
  userId: string;
  amount: number;
  stripeToken: string;
}

export interface CardDetails {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export type TopupResponse = {
  cardDetails: CardDetails;
} & TransactionAndBalance;

import { lambdaBaseUrl } from '../../../service/src/baseUrl';

const { get, post } = fetch('topup', lambdaBaseUrl);

export const createTopup = (key, request: TopupRequest) =>
  post<TopupResponse>(1, key, '/', request);

export const getCardDetails = (key, userId: string) =>
  get<CardDetails>(1, key, `/${userId}/cardDetails`);

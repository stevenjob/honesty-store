import fetch from '@honesty-store/service/lib/fetch';
import { TransactionAndBalance } from '@honesty-store/transaction';

export interface Stripe {
  customer: any;
  nextChargeToken: string;
}

export interface TopupAccount {
  id: string;
  version: number;
  userId: string;
  test: boolean;
  lastTopup?: TransactionAndBalance;
  stripe?: Stripe;
  stripeHistory?: Stripe[];
  legacyId?: string;
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
} & Partial<TransactionAndBalance>;

export interface TopupCardDetailsChanged {
  id: string;
  type: 'topup-card-details-change';
  accountId: string;
  userId: string;
  stripeToken: string;
}

export interface TopupAttempted {
  id: string;
  type: 'topup-attempt';
  accountId: string;
  userId: string;
  amount: number;
}

export type TopupEvent = TopupCardDetailsChanged | TopupAttempted;

const { get, post } = fetch('topup');

export const createTopup = (key, request: TopupRequest) =>
  post<TopupResponse>(1, key, '/', request);

export const getCardDetails = (key, accountId: string) =>
  get<CardDetails>(1, key, `/${accountId}/cardDetails`);

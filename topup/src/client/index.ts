import fetch from '@honesty-store/service/lib/fetch';
import { Transaction, TransactionAndBalance } from '@honesty-store/transaction';

export interface Stripe {
  customer: any;
  nextChargeToken: string;
  lastSuccess?: number;
  lastError?: CardError;
  retriesRemaining: number;
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

export type CardError = 'CardIncorrectNumber' | 'CardInvalidNumber' | 'CardInvalidExpiryMonth' | 'CardInvalidExpiryYear' | 'CardIncorrectCVC' | 'CardInvalidCVC' | 'CardExpired' | 'CardDeclined' | 'CardError';

export interface CardDetails {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  lastError?: CardError;
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

export type TransactionWithBalance = Transaction & { balance: number };

export type TopupEvent = TopupCardDetailsChanged | TopupAttempted;

const { get, post } = fetch('topup');

export const createTopup = (key, request: TopupRequest) =>
  post<TopupResponse>(1, key, '/', request);

export const recordTransaction = (key, { transaction, balance }: TransactionAndBalance) =>
  post<TopupAccount>(1, key, '/transaction', { ...transaction, balance });

export const getCardDetails = (key, accountId: string) =>
  get<CardDetails>(1, key, `/${accountId}/cardDetails`);

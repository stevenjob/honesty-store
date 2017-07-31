import fetch from '@honesty-store/service/lib/fetch';
import { Transaction, TransactionAndBalance } from '@honesty-store/transaction';

export interface TopupSuccess {
  status: 'success';
  transactionAndBalance: TransactionAndBalance;
  timestamp: number;
}

export interface TopupInProgress {
  status: 'in-progress';
  amount: number;
  stripeFee: number;
  chargeId: string;
}

export interface TopupError {
  status: 'error';
  amount: number;
  code: CardError;
  retriesRemaining: number;
}

export type TopupStatus = TopupSuccess | TopupInProgress | TopupError;

export interface Stripe {
  customer: any;
}

export interface TopupAccount {
  id: string;
  version: number;
  userId: string;
  test: boolean;
  status?: TopupStatus;
  stripe?: Stripe;
  stripeHistory?: Stripe[];
  legacyId?: string;
}

export interface TopupRequest {
  id: string;
  accountId: string;
  userId: string;
  amount: number;
  stripeToken: string;
}

export type CardError = 'CardIncorrectNumber' |
  'CardInvalidNumber' |
  'CardInvalidExpiryMonth' |
  'CardInvalidExpiryYear' |
  'CardIncorrectCVC' |
  'CardInvalidCVC' |
  'CardExpired' |
  'CardDeclined' |
  'CardError';

export interface CardDetails {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  lastError?: CardError;
}

export interface TopupResponse {
  cardDetails: CardDetails;
}

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

export const getTopupAccount = (key, id: string) =>
  get<TopupAccount>(1, key, `/${id}`);

export const createTopup = (key, request: TopupRequest) =>
  post<TopupResponse>(1, key, '/', request);

export const recordTransaction = (key, { transaction, balance }: TransactionAndBalance) =>
  post<TopupAccount>(1, key, '/transaction', { ...transaction, balance });

export const getCardDetails = (key, accountId: string) =>
  get<CardDetails>(1, key, `/${accountId}/cardDetails`);

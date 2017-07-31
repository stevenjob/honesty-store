import ms = require('ms');

import { debug } from '@honesty-store/service/lib/log';
import { createTopup, getTopupAccount, TopupAccount, TopupRequest,  TopupResponse } from '@honesty-store/topup';
import { TransactionAndBalance } from '@honesty-store/transaction';

import { purchase } from '../services/transaction';

const wait = (period: string) => new Promise(resolve => setTimeout(resolve, ms(period)));

const within = (timestamp: number, period: string): boolean => Math.abs(timestamp - Date.now()) < ms(period);

const getLastTopupTransactionAndBalance = async (key: any, id: string): Promise<TransactionAndBalance> => {
  let attemptsRemaining = 5;
  while (attemptsRemaining > 0) {
    try {
      const { status } = await getTopupAccount(key, id);
      // the within check works around any eventual consistency problems
      if (status != null && status.status === 'success' && within(status.timestamp, '10s')) {
        return status.transactionAndBalance;
      }
      debug(key, `Topup account ${id} not has status ${status && status.status}`);
    } catch (e) {
      if (e.code !== `Key not found ${id}`) {
        throw e;
      }
      debug(key, `Topup account ${id} not found`);
    }
    attemptsRemaining--;
    debug(key, `Attempts remaining ${attemptsRemaining}`);
    if (attemptsRemaining > 0) {
      await wait('1s');
    }
  }
  throw new Error(`Failed to retrieve topup transaction after 5 attempts`);
};

export const topup = async (key, topupRequest: TopupRequest): Promise<TopupResponse & Partial<TransactionAndBalance>> => {
  const { cardDetails } = await createTopup(key, topupRequest);
  const tx = topupRequest.amount > 0 ? await getLastTopupTransactionAndBalance(key, topupRequest.accountId) : {};
  return { cardDetails, ...tx };
};

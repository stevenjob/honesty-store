import * as ms from 'ms';
import * as stripeFactory from 'stripe';
import { v4 as uuid } from 'uuid';

import { error } from '@honesty-store/service/lib/log';

import {
  TopupAccount,
  TopupError,
  // TopupStatus,
  TopupInProgress,
  TopupSuccess,
  Stripe
} from './client';
import { isRetryableStripeError, userErrorCodeFromStripeError, userErrorFromStripeError } from './errors';

const stripeTest = stripeFactory(process.env.TEST_STRIPE_KEY);
const stripeProd = stripeFactory(process.env.LIVE_STRIPE_KEY);

const stripeForUser = ({ test }) => {
  return test ? stripeTest : stripeProd;
};

const getStripeCustomerId = ({ id, stripe }: TopupAccount) => {
  if (stripe == null) {
    throw new Error(`No Stripe details found for ${id}.`);
  }
  return stripe.customer.id;
};

export const createCustomer = async (key, topupAccount: TopupAccount, stripeToken: string): Promise<Stripe> => {
  const { id, stripe } = topupAccount;

  const description = stripe == null ?
    `registration for ${id}` : `adding new card for ${id}`;

  try {
    const customer = await stripeForUser(topupAccount)
      .customers
      .create({
        source: stripeToken,
        description,
        metadata: {
          accountId: id
        }
      });
    return {
      customer,
      nextChargeToken: uuid()
    };
  } catch (e) {
    error(key, `couldn't create stripe customer`, e);
    throw userErrorFromStripeError(e);
  }
}

type TopupStatus = TopupSuccess | TopupInProgress | TopupError;

export const attemptTopup = async (key, topupAccount: TopupAccount, idempotencyKey: string, amount: number): Promise<TopupStatus | undefined> => {

  const { id, status } = topupAccount;

  if (status != null) {
    // old accounts didn't have status, assume they're good to go

    if (status.status === 'success' && status.timestamp >= Date.now() - ms('24h')) {
      // safety valve, don't charge multiple times within 24h period
      return;
    }

    if (status.status === 'in-progress') {
      // existing topup must complete
      return;
    }

    if (status.status === 'error' && status.retriesRemaining === 0) {
      // user must update card details
      return;
    }
  }

  try {
    const topupCustomerId = getStripeCustomerId(topupAccount);
    const charge = await stripeForUser(topupAccount).charges.create(
      {
        amount,
        currency: 'gbp',
        customer: topupCustomerId,
        description: `topup for ${id}`,
        metadata: {
          accountId: id
        },
        expand: ['balance_transaction']
      },
      {
        idempotency_key: idempotencyKey
      }
    );

    return {
      status: 'in-progress',
      amount,
      stripeFee: charge.balance_transaction.fee,
      chargeId: charge.id,
      topupCustomerId: topupCustomerId
    };
  } catch (e) {
    /* Note to future devs: 'Must provide source or customer.'
    * appears to be a bug with stripe's API.
    *
    * We've correctly provided a customer, so the error seems odd. I
    * believe it's to do with the idempotency_key being incorrect, so
    * that's the first place to start looking. */
    error(key, `couldn't create stripe charge`, e);

    const retriesRemaining = !isRetryableStripeError(e) ? 0 :
      (status != null && status.status === 'error') ? status.retriesRemaining - 1 : 2;

    return {
      status: 'error',
      amount,
      code: userErrorCodeFromStripeError(e),
      retriesRemaining
    };
  }
};
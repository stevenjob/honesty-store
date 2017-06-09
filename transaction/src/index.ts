import { config } from 'aws-sdk';

import { CodedError } from '@honesty-store/service/lib/error';
import { lambdaRouter, LambdaRouter } from '@honesty-store/service/lib/lambdaRouter';
import { assertValidAccountId, createAccount, getAccountInternal, updateAccount } from './account';
import {
  AccountAndTransactions,
  assertValidTransaction,
  AUTO_REFUND_PERIOD,
  balanceLimit,
  extractFieldsFromTransactionId,
  InternalAccount,
  Transaction,
  TransactionAndBalance,
  TransactionBody,
  TransactionDetails,
  TransactionType
} from './client';
import {
  createTransactionId,
  getTransaction,
  getTransactions,
  hashTransaction,
  putTransaction,
  walkTransactions
} from './transaction';

const ACCOUNT_TRANSACTION_CACHE_SIZE = 10;
const GET_TRANSACTION_LIMIT = 10;

config.region = process.env.AWS_REGION;

type UserPermittedRefundReason = 'outOfStock' | 'accidentalPurchase' | 'stockExpired';
const userPermittedRefundReasons = ['outOfStock', 'accidentalPurchase', 'stockExpired'];
const isUserPermittedRefundReason = (reason: string): reason is UserPermittedRefundReason => {
  return userPermittedRefundReasons.some(permittedReason => permittedReason === reason);
};

type SupportPermittedRefundReason = UserPermittedRefundReason | 'other';
const supportPermittedRefundReasons = [...userPermittedRefundReasons, 'other'];
const isSupportPermittedRefundReason = (reason: string): reason is SupportPermittedRefundReason => {
  return supportPermittedRefundReasons.some(permittedReason => permittedReason === reason);
};

const getAccountAndTransactions = async ({ accountId, limit = GET_TRANSACTION_LIMIT }): Promise<AccountAndTransactions> => {
  assertValidAccountId(accountId);

  const { transactionHead, cachedTransactions, ...externalAccount } = await getAccountInternal({ accountId });

  const idToFetch = cachedTransactions.length > 0
    ? cachedTransactions[cachedTransactions.length - 1].next
    : transactionHead;

  const transactions = idToFetch ? await getTransactions({
    transactionId: idToFetch,
    limit: limit - cachedTransactions.length
  }) : [];

  return {
    ...externalAccount,
    transactions: [
      ...cachedTransactions,
      ...transactions
    ]
  };
};

const createTransaction = async (
  originalAccount: InternalAccount,
  body: TransactionBody
): Promise<TransactionAndBalance> => {
  const transactionDetails: TransactionDetails = {
    timestamp: Date.now(),
    next: originalAccount.transactionHead,
    ...body
  };

  const transaction = {
    id: createTransactionId({ accountId: originalAccount.id, transactionId: hashTransaction(transactionDetails) }),
    ...transactionDetails
  };

  assertValidTransaction(transaction);

  const updatedBalance = originalAccount.balance + transaction.amount;

  if (updatedBalance < 0) {
    throw new Error(`Balance would be negative ${updatedBalance}`);
  }
  if (updatedBalance > balanceLimit) {
    throw new Error(`Balance would be greater than ${balanceLimit} (${updatedBalance})`);
  }

  await putTransaction(transaction);

  const updatedAccount: InternalAccount = {
    ...originalAccount,
    version: originalAccount.version + 1,
    balance: updatedBalance,
    transactionHead: transaction.id,
    cachedTransactions: [transaction, ...originalAccount.cachedTransactions.slice(0, ACCOUNT_TRANSACTION_CACHE_SIZE - 1)]
  };

  await updateAccount({ updatedAccount, originalAccount });

  return {
    transaction: transaction,
    balance: updatedAccount.balance
  };
};

const assertRefundableTransactionType = (type: TransactionType) => {
  if (type !== 'purchase') {
    throw new CodedError('NonRefundableTransactionType', `Only purchase transactions may be refunded`);
  }
};

const assertUserCanAutoRefundTransaction = (userId: string, transaction: Transaction, refundCutOffDate: number) => {
  assertRefundableTransactionType(transaction.type);

  const { id: transactionId, timestamp, data: { userId: transactionUserId } } = transaction;
  if (timestamp < refundCutOffDate) {
    throw new CodedError('AutoRefundPeriodExpired', 'Refunds can only be requested up to 1 hour after initial purchase');
  }
  if (transactionUserId == null || transactionUserId !== userId) {
    throw new Error(`userId contained within transaction ${transactionId} does not match id of user requesting refund (${userId})`);
  }
};

const issueUserRequestedRefund = async (transactionId, userId, reason) => {
  if (!isUserPermittedRefundReason(reason)) {
    throw new Error('Invalid reason for refund');
  }

  const transactionToRefund = await getTransaction(transactionId);

  assertRefundableTransactionType(transactionToRefund.type);

  const refundCutOffDate = Date.now() - AUTO_REFUND_PERIOD;
  assertUserCanAutoRefundTransaction(userId, transactionToRefund, refundCutOffDate);

  return await issueRefund(transactionToRefund, reason, refundCutOffDate);
};

const issueSupportRequestedRefund = async (transactionId, reason, dateLimit) => {
  if (!isSupportPermittedRefundReason(reason)) {
    throw new Error(`Reason must be one of ${supportPermittedRefundReasons}`);
  }
  if (!Number.isInteger(dateLimit)) {
    throw new Error(`Invalid timestamp for dateLimit ${dateLimit}`);
  }

  const transactionToRefund = await getTransaction(transactionId);

  return await issueRefund(transactionToRefund, reason, dateLimit);
};

const issueRefund = async (transactionToRefund: Transaction, reason: SupportPermittedRefundReason, dateLimit: number) => {
  const { id: transactionId } = transactionToRefund;

  const { accountId } = extractFieldsFromTransactionId(transactionId);
  const account = await getAccountInternal({ accountId });

  if (account.transactionHead == null) {
    throw new Error('No transactions to refund');
  }

  for await (const transaction of walkTransactions(account.transactionHead)) {
    if (transaction.type === 'refund' && transaction.other === transactionId) {
      throw new CodedError('RefundAlreadyIssued', `Refund already issued for transactionId ${transactionId}`);
    }
    if (transaction.timestamp < dateLimit) {
      throw new Error(`Transaction cannot be refunded as is earlier than specified date limit ${dateLimit}`);
    }
    if (transaction.id === transactionId) {
      break;
    }
  }

  const response = await createTransaction(
    account,
    {
      type: 'refund',
      amount: -transactionToRefund.amount,
      data: {
        ...transactionToRefund.data,
        reason
      },
      other: transactionToRefund.id
    }
  );
  return {
    balance: response.balance,
    transaction: response.transaction
  };
};

export const router: LambdaRouter = lambdaRouter('transaction', 1);

router.get(
  '/account/:accountId',
  async (_key, { accountId }) => await getAccountAndTransactions({ accountId })
);

router.post(
  '/account/:accountId',
  async (_key, { accountId }, { type, amount, data }) => {
    const account = await getAccountInternal({ accountId });
    return await createTransaction(account, { type, amount, data });
  }
);

router.post(
  '/account',
  async (_key, { }, { accountId }) => {
    const internalAccount = await createAccount({ accountId });
    const { transactionHead, cachedTransactions, ...externalAccount } = internalAccount;
    return externalAccount;
  }
);

router.get(
  '/tx/:transactionId',
  async (_key, { transactionId }) => await getTransaction(transactionId)
);

router.post(
  '/tx/:transactionId/refund/user',
  async (_key, { transactionId }, { userId, reason }) => await issueUserRequestedRefund(transactionId, userId, reason)
);

router.post(
  '/tx/:transactionId/refund/support',
  async (_key, { transactionId }, { dateLimit, reason }) => await issueSupportRequestedRefund(transactionId, reason, dateLimit)
);

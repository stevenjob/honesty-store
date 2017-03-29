import { config } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');

import { serviceAuthentication, serviceRouter } from '../../service/src/router';
import { assertValidAccountId, createAccount, DBAccount, getAccountInternal, updateAccount } from './account';
import { AccountAndTxs, balanceLimit, TEST_DATA_EMPTY_ACCOUNT_ID, TransactionAndBalance, TransactionBody } from './client';
import { assertValidTransaction, createTransactionId, getTransactions, hashTransaction, putTransaction } from './tx';

const CACHED_TX_COUNT = 10;

config.region = process.env.AWS_REGION;

const getAccountAndTxs = async ({ accountId }): Promise<AccountAndTxs> => {
  assertValidAccountId(accountId);

  const internalAccount = await getAccountInternal({ accountId });
  const { latestTx, cachedTransactions, ...externalAccount } = internalAccount;

  const transactions = await getTransactions({
    txId: latestTx,
    limit: CACHED_TX_COUNT - cachedTransactions.length
  });

  return {
    ...externalAccount,
    transactions: [
      ...cachedTransactions,
      ...transactions
    ]
  };
};

const createTransaction = async ({ accountId, type, amount, data }): Promise<TransactionAndBalance> => {
  assertValidAccountId(accountId);

  const originalAccount = await getAccountInternal({ accountId });

  const transactionDetails: TransactionBody & { next: string } = {
    timestamp: Date.now(),
    type,
    amount,
    data,
    next: originalAccount.latestTx
  };

  const transaction = {
    id: createTransactionId({ accountId, txId: hashTransaction(transactionDetails) }),
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

  const updatedAccount: DBAccount = {
    ...originalAccount,
    balance: updatedBalance,
    latestTx: transaction.id,
    cachedTransactions: [transaction, ...originalAccount.cachedTransactions.slice(0, CACHED_TX_COUNT - 1)]
  };

  await updateAccount({ updatedAccount, originalAccount });

  return {
    transaction: transaction,
    balance: updatedAccount.balance
  };
};

const app = express();

app.use(bodyParser.json());

const router = serviceRouter('transaction', 1);

router.get(
  '/:accountId',
  serviceAuthentication,
  async (_key, { accountId }) => await getAccountAndTxs({ accountId })
);

router.post(
  '/:accountId',
  serviceAuthentication,
  async (_key, { accountId }, { type, amount, data }) =>
    await createTransaction({ accountId, type, amount, data })
);

router.post(
  '/',
  serviceAuthentication,
  async (_key, {}, { accountId }) => {
    const internalAccount = await createAccount({ accountId });
    const { latestTx, cachedTransactions, ...externalAccount } = internalAccount;
    return externalAccount;
  }
);

app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => {
  getAccountAndTxs({ accountId: TEST_DATA_EMPTY_ACCOUNT_ID })
    .then(() => {
      res.send(200);
    })
    .catch(() => {
      res.send(500);
    });
});

app.listen(3000);

import { createTransaction, getAccount, TransactionDetails } from '../../../transaction/src/client/index';
import { getUsersAccountId } from '../../../user/src/client/index';

export const addItemTransaction = async (userID, itemPrice) => {
  const transaction: TransactionDetails = {
      type: 'purchase',
      amount: -itemPrice,
      data: {}
  };

  return await createTransaction(
    await getUsersAccountId(userID),
    transaction);
};

export const addTopUpTransaction = async (userID, amount) => {
  const transaction: TransactionDetails = {
      type: 'topup',
      amount,
      data: {}
  };

  return await createTransaction(
    await getUsersAccountId(userID),
    transaction);
};

export const getTransactionHistory = async (userID) => {
    const { transactions } = await getAccount(await getUsersAccountId(userID));

    return transactions;
};

export const getBalance = async (userID) => {
  const userTransactions = await getTransactionHistory(userID);
  return userTransactions.reduce((balance, transaction) => balance + transaction.amount, 0);
};

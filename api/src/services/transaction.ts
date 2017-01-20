import { createTransaction, getAccount, TransactionDetails } from '../../../transaction/src/client/index';
import { getPrice } from '../services/store';
import { getUser } from '../../../user/src/client/index';

const getUsersAccountId = async (userId) => (await getUser(userId)).accountId;

const assertValidQuantity = (quantity) => {
    if (!Number.isInteger(quantity)) {
        throw new Error(`quantity ${quantity} isn't an integer`);
    }
    if (quantity <= 0) {
        throw new Error(`quantity ${quantity} too small`);
    }
    if (quantity > 10) {
        throw new Error(`quantity ${quantity} too large`);
    }
};

export const purchase = async ({ itemID, userID, storeID, quantity }) => {
    assertValidQuantity(quantity);

    const price = quantity * getPrice(itemID);

    const transaction: TransactionDetails = {
        type: 'purchase',
        amount: -price,
        data: {
            quantity,
            itemID,
            userID,
            storeID,
        }
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

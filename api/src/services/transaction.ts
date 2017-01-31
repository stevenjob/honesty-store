import { createTransaction, getAccount, TransactionDetails } from '../../../transaction/src/client/index';
import { getPrice } from '../services/store';

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

export const purchase = async ({ key, itemID, userID, accountID, storeID, quantity }) => {
    assertValidQuantity(quantity);

    const price = quantity * getPrice(itemID);

    const transaction: TransactionDetails = {
        type: 'purchase',
        amount: -price,
        data: {
            quantity: String(quantity),
            itemId: itemID,
            userId: userID,
            storeId: storeID
        }
    };

    return await createTransaction(key, accountID, transaction);
};

export const getTransactionHistory = async ({ key, accountID }) => {
    const { transactions } = await getAccount(key, accountID);

    return transactions;
};

export const getBalance = async (userID) => {
  const userTransactions = await getTransactionHistory(userID);
  return userTransactions.reduce((balance, transaction) => balance + transaction.amount, 0);
};

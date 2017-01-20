import { createTransaction, getAccount, TransactionDetails } from '../../../transaction/src/client/index';
import { getPrice } from '../services/store';
import { getUser } from '../../../user/src/client/index';

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

export const purchase = async ({ itemID, userID, accountID, storeID, quantity }) => {
    assertValidQuantity(quantity);

    const price = quantity * getPrice(itemID);

    const transaction: TransactionDetails = {
        type: 'purchase',
        amount: -price,
        data: {
            quantity: String(quantity),
            itemId: String(itemID),
            userId: userID,
            storeId: storeID,
        }
    };

    return await createTransaction(accountID, transaction);
};

export const getTransactionHistory = async ({ accountID }) => {
    const { transactions } = await getAccount(accountID);

    return transactions;
};

export const getBalance = async (userID) => {
  const userTransactions = await getTransactionHistory(userID);
  return userTransactions.reduce((balance, transaction) => balance + transaction.amount, 0);
};

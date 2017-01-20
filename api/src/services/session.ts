import { getUser } from '../../../user/src/client/index';
import { getTransactionHistory, getBalance } from '../services/transaction'
import { Transaction } from '../../../transaction/src/client/index';
import { getItems, storeIDToStoreCode } from '../services/store'

export interface SessionData {
    user: {
        balance: number;
        transactions: Transaction[];
        cardNumber: string;
    };
    store: {
        code: string;
        items: {
            id: string;
            name: string;
            price: number;
            count: number;
        }[];
    };
};

const getAccountSessionData = async (accountID) => {
  const allTransactions = await getTransactionHistory({ accountID });
  const recentTransactions = allTransactions.slice(0, 10);

  return {
    balance: allTransactions.reduce((balance, transaction) => balance + transaction.amount, 0),
    transactions: recentTransactions,
  };
};

const getStoreSessionData = async (userID) => {
  const { defaultStoreId } = await getUser(userID);

  const defaultStoreCode = storeIDToStoreCode(defaultStoreId);

  return {
    items: getItems(defaultStoreCode),
    code: defaultStoreCode,
  };
};

export const getSessionData = async ({ userID, accountID }) => {
  const [ user, store ] = await Promise.all([
    getAccountSessionData(accountID),
    getStoreSessionData(userID),
  ]);
  return { user, store };
};

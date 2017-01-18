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

const getUserSessionData = async (userID) => {
  const recentTransactions = (await getTransactionHistory(userID)).slice(0, 10);

  return {
    balance: await getBalance(userID),
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

export const getSessionData = async (userID) => {
  const [ user, store ] = await Promise.all([
    getUserSessionData(userID),
    getStoreSessionData(userID),
  ]);
  return { user, store };
};

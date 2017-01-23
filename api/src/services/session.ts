import { getUser } from '../../../user/src/client/index';
import { getTransactionHistory, getBalance } from '../services/transaction'
import { Transaction } from '../../../transaction/src/client/index';
import { getItems, storeIDToStoreCode } from '../services/store'

export interface SessionData {
    user: {
        balance: number;
        transactions: Transaction[];
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


const getUserSessionData = async ({ accountId: accountID }) => {
  const allTransactions = await getTransactionHistory({ accountID });
  const recentTransactions = allTransactions.slice(0, 10);

  return {
    balance: allTransactions.reduce((balance, transaction) => balance + transaction.amount, 0),
    transactions: recentTransactions,
  };
};

const getStoreSessionData = async (key, userID) => {
  const { defaultStoreId } = await getUser(key, userID);

  const defaultStoreCode = storeIDToStoreCode(defaultStoreId);

  return {
    items: getItems(defaultStoreCode),
    code: defaultStoreCode,
  };
};

export const getSessionData = async (key, { user }) => {
  const { id, accessToken, refreshToken } = user;
  const [ userProfile, store ] = await Promise.all([
    getUserSessionData(user),
    getStoreSessionData(key, id),
  ]);
  return {
    user: userProfile,
    store,
    refreshToken,
    accessToken
  };
};

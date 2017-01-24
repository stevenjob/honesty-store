import { getUser } from '../../../user/src/client/index';
import { getTransactionHistory, getBalance } from '../services/transaction'
import { Transaction } from '../../../transaction/src/client/index';
import { getCardDetails } from '../../../topup/src/client/index';
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


const getUserSessionData = async ({ key, id, accountId: accountID, emailAddress }) => {
  const allTransactions = await getTransactionHistory({ key, accountID });
  const recentTransactions = allTransactions.slice(0, 10);
  const cardDetails = await getCardDetails(key, id);

  return {
    emailAddress,
    balance: allTransactions.reduce((balance, transaction) => balance + transaction.amount, 0),
    transactions: recentTransactions,
    cardDetails
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
    getUserSessionData({ ...user, key }),
    getStoreSessionData(key, id),
  ]);
  return {
    user: userProfile,
    store,
    refreshToken,
    accessToken
  };
};

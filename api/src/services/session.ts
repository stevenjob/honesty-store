import { getCardDetails } from '../../../topup/src/client/index';
import { Transaction } from '../../../transaction/src/client/index';
import { userRegistered } from '../../../user/src/client';
import { getUser } from '../../../user/src/client/index';
import { getItems, storeIDToStoreCode } from '../services/store';
import { getTransactionHistory } from '../services/transaction';

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
}

const getUserSessionData = async (key, user) => {
  const { id, accountId: accountID, emailAddress } = user;
  const allTransactions = accountID ? await getTransactionHistory({ key, accountID }) : [];
  const recentTransactions = allTransactions.slice(0, 10);

  let cardDetails;
  if (userRegistered(user)) {
    cardDetails = await getCardDetails(key, id);
  }

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
    code: defaultStoreCode
  };
};

export const getSessionData = async (key, { user }) => {
  const { id, accessToken, refreshToken } = user;
  const [userProfile, store] = await Promise.all([
    getUserSessionData(key, user),
    getStoreSessionData(key, id)
  ]);
  return {
    user: userProfile,
    store,
    refreshToken,
    accessToken
  };
};

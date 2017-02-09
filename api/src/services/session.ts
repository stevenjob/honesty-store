import { getCardDetails } from '../../../topup/src/client/index';
import { Transaction } from '../../../transaction/src/client/index';
import { userRegistered } from '../../../user/src/client';
import { storeIDToStoreCode, storeItems } from '../services/store';
import { getExpandedTransactionsAndBalance } from '../services/transaction';

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
  const { balance, transactions } = accountID ?
    await getExpandedTransactionsAndBalance({ key, accountID }) :
    { balance: 0, transactions: [] };

  let cardDetails;
  if (userRegistered(user)) {
    cardDetails = await getCardDetails(key, id);
  }

  return {
    emailAddress,
    balance,
    transactions,
    cardDetails
  };
};

const getStoreSessionData = async (user) => {
  const { defaultStoreId } = user;

  const defaultStoreCode = storeIDToStoreCode(defaultStoreId);

  return {
    items: storeItems(defaultStoreCode),
    code: defaultStoreCode
  };
};

export const getSessionData = async (key, { user }) => {
  const { accessToken, refreshToken } = user;
  const [userProfile, store] = await Promise.all([
    getUserSessionData(key, user),
    getStoreSessionData(user)
  ]);
  return {
    user: userProfile,
    store,
    refreshToken,
    accessToken
  };
};

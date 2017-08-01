import { getStoreFromId, StoreRevenue } from '@honesty-store/store';
import { CardDetails, getCardDetails } from '@honesty-store/topup';
import { AUTO_REFUND_PERIOD, Transaction } from '@honesty-store/transaction';
import { userRegistered } from '@honesty-store/user';
import { StoreItem, storeItems } from '../services/store';
import { getExpandedTransactionsAndAccount } from '../services/transaction';

export interface UserSessionData {
  balance: number;
  transactions: Transaction[];
  cardDetails: CardDetails;
  features: any;
  emailAddress?: string;
  creditLimit: number;
  id: string;
  flags: any;
}
export interface UserRevenue {
  startInclusive: number;
  total: number;
}
export interface StoreSessionData {
  code: string;
  items: StoreItem[];
  userRevenue: UserRevenue[];
}
export interface SessionData {
  user: UserSessionData;
  store: StoreSessionData;
  refreshToken: string;
  accessToken: string;
  autoRefundPeriod: number;
}

const getUserSessionData = async (key, user): Promise<UserSessionData> => {
  const { id, accountId, emailAddress, flags } = user;
  const { balance = 0, transactions = [], creditLimit = -1000 } = accountId
    ? await getExpandedTransactionsAndAccount({ key, accountID: accountId })
    : {};

  let cardDetails = null;
  if (userRegistered(user)) {
    try {
      cardDetails = await getCardDetails(key, accountId);
    } catch (e) {
      if (e.code !== 'NoCardDetailsPresent') {
        throw e;
      }

      /* User is registered but has no card details - this means they managed
       * to sign up but weren't successful in their initial topup. */
    }
  }

  return {
    id,
    emailAddress,
    balance,
    transactions,
    cardDetails,
    creditLimit,
    features: {},
    flags
  };
};

const getRecentUserRevenue = (storeRevenue: StoreRevenue[], userId: string): UserRevenue[] => {
  const existingUserRevenue: UserRevenue[] = storeRevenue
    .map(({ startInclusive, seller }) => ({ startInclusive, total: seller[userId] || 0 }));

  const today = new Date();
  const expectedDates = [
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1),
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1),
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 2, 1)
  ];

  return expectedDates.map((timestamp) => {
    return existingUserRevenue.find(({ startInclusive }) => startInclusive === timestamp) ||
      ({ startInclusive: timestamp, total: 0 });
  });
};

const getStoreSessionData = async (key, user): Promise<StoreSessionData> => {
  const { defaultStoreId, id: userId } = user;

  const [{ code, revenue }, items] = await Promise.all([
    getStoreFromId(key, defaultStoreId),
    storeItems(key, defaultStoreId, userId)
  ]);

  return {
    items,
    code,
    userRevenue: getRecentUserRevenue(revenue, userId)
  };
};

export const getSessionData = async (key, { user }): Promise<SessionData> => {
  const { accessToken, refreshToken } = user;
  const [userProfile, store] = await Promise.all([
    getUserSessionData(key, user),
    getStoreSessionData(key, user)
  ]);
  return {
    autoRefundPeriod: AUTO_REFUND_PERIOD,
    user: userProfile,
    store,
    refreshToken,
    accessToken
  };
};

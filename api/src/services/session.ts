import { getStoreFromId } from '@honesty-store/store';
import { getUserSurveys } from '@honesty-store/survey';
import { CardDetails, getCardDetails } from '@honesty-store/topup';
import { AUTO_REFUND_PERIOD, Transaction } from '@honesty-store/transaction';
import { userRegistered } from '@honesty-store/user';
import { StoreItem, storeItems } from '../services/store';
import { getExpandedTransactionsAndAccount } from '../services/transaction';
import { expandTopPrioritySurvey } from './survey';

export interface UserSessionData {
  balance: number;
  transactions: Transaction[];
  cardDetails: CardDetails;
  features: any;
  emailAddress?: string;
  creditLimit: number;
  id: string;
}
export interface StoreSessionData {
  code: string;
  items: StoreItem[];
}
export interface SessionData {
  user: UserSessionData;
  store: StoreSessionData;
  refreshToken: string;
  accessToken: string;
  survey: any;
  autoRefundPeriod: number;
}

const marketplaceFeature = ({ defaultStoreId }) => {
  const allowedStoreIds = [
    'b8d7305b-bb7d-4bbe-8b2f-5e94c6267bb6', // sl-ncl
    'f79ff70c-2103-43f9-922d-d54a16315361', // sl-edn
    '1e7c9c0d-a9be-4ab7-8499-e57bf859978d'  // dev-test
  ];

  return allowedStoreIds.indexOf(defaultStoreId) !== -1;
};

export const getUserFeatures = (user) => ({
  marketplace: marketplaceFeature(user)
});

const getUserSessionData = async (key, user): Promise<UserSessionData> => {
  const { id, accountId, emailAddress } = user;
  const { balance = 0, transactions = [], creditLimit = 0 } = accountId
    ? await getExpandedTransactionsAndAccount({ key, accountID: accountId })
    : {};

  const features = getUserFeatures(user);

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
    features
  };
};

const getStoreSessionData = async (key, user): Promise<StoreSessionData> => {
  const { defaultStoreId, id: userId } = user;

  const [{ code }, items] = await Promise.all([
    getStoreFromId(key, defaultStoreId),
    storeItems(key, defaultStoreId, userId)
  ]);

  return {
    items,
    code
  };
};

const getSurveySessionData = async (key, user) => {
  const surveys = await getUserSurveys(key, user.id);
  return await expandTopPrioritySurvey(surveys);
};

export const getSessionData = async (key, { user }): Promise<SessionData> => {
  const { accessToken, refreshToken } = user;
  const [userProfile, store, survey] = await Promise.all([
    getUserSessionData(key, user),
    getStoreSessionData(key, user),
    getSurveySessionData(key, user)
  ]);
  return {
    autoRefundPeriod: AUTO_REFUND_PERIOD,
    user: userProfile,
    store,
    refreshToken,
    accessToken,
    survey
  };
};

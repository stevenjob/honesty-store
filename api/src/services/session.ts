import { getUserSurveys } from '../../../survey/src/client';
import { CardDetails, getCardDetails } from '../../../topup/src/client/index';
import { Transaction } from '../../../transaction/src/client/index';
import { userRegistered } from '../../../user/src/client';
import { storeIDToStoreCode, StoreItem, storeItems } from '../services/store';
import { getExpandedTransactionsAndBalance } from '../services/transaction';
import { expandTopPrioritySurvey } from './survey';

export interface UserSessionData {
  balance: number;
  transactions: Transaction[];
  cardDetails: CardDetails;
  features: any;
  emailAddress: string;
}
interface StoreSessionData {
  code: string;
  items: StoreItem[];
}
interface SessionData {
  user: UserSessionData;
  store: StoreSessionData;
}

const marketplaceFeature = ({ defaultStoreId }) => {
  const allowedStoreIds = ['sl-ncl', 'sl-edn'];
  return allowedStoreIds.indexOf(defaultStoreId) !== -1;
};

export const getUserFeatures = (user) => ({
  marketplace: marketplaceFeature(user)
});

const getUserSessionData = async (key, user): Promise<UserSessionData> => {
  const { id, accountId: accountID, emailAddress } = user;
  const { balance, transactions } = accountID ?
    await getExpandedTransactionsAndBalance({ key, accountID }) :
    { balance: 0, transactions: [] };

  const features = getUserFeatures(user);

  let cardDetails = null;
  if (userRegistered(user)) {
    try {
      cardDetails = await getCardDetails(key, id);
    } catch (e) {
      if (e.code !== 'NoCardDetailsPresent') {
        throw e;
      }

      /* User is registered but has no card details - this means they managed
       * to sign up but weren't successful in their initial topup. */
    }
  }

  return {
    emailAddress,
    balance,
    transactions,
    cardDetails,
    features
  };
};

const getStoreSessionData = async (key, user): Promise<StoreSessionData> => {
  const { defaultStoreId } = user;

  const defaultStoreCode = storeIDToStoreCode(defaultStoreId);

  return {
    items: await storeItems(key, defaultStoreCode),
    code: defaultStoreCode
  };
};

const getSurveySessionData = async (key, user) => {
  const surveys = await getUserSurveys(key, user.id);
  return expandTopPrioritySurvey(surveys);
};

export const getSessionData = async (key, { user }): Promise<SessionData> => {
  const { accessToken, refreshToken } = user;
  const [userProfile, store, survey] = await Promise.all([
    getUserSessionData(key, user),
    getStoreSessionData(key, user),
    getSurveySessionData(key, user)
  ]);
  return {
    user: userProfile,
    store,
    refreshToken,
    accessToken,
    survey
  };
};

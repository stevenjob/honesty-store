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

const marketplaceFeature = ({ id }) => {
  const allowedUsers = [
    '42dfedaa-ca40-4c86-8fa6-fabe71ac209e', // Gary
    'defabb87-e084-4334-91da-18778e3f2e78', // Colin
    'f9c8b541-0a30-4adc-8e0d-887e6db9f301', // Chris
    '77fcd8c1-63df-48fa-900a-0c0bb57687b3', // Chris (email+100)
    'c03dfffc-832a-426f-8a89-efbc4b9d23f6', // Simon W
    '45dd50e5-04c5-4390-b760-75f141b28901', // Simon K
    'c71733c4-dc05-42f9-848e-fb53bf08a2d7', // Sam
    'a8960624-7558-468c-9791-984ca0c620ba'  // Rob
  ];

  return allowedUsers.indexOf(id) !== -1;
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

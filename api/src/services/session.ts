import { getUserSurveys } from '../../../survey/src/client';
import { getCardDetails } from '../../../topup/src/client/index';
import { Transaction } from '../../../transaction/src/client/index';
import { userRegistered } from '../../../user/src/client';
import { getItem } from '../services/item';
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

const getTopPrioritySurvey = async (key, user) => {
  const [ survey ] = await getUserSurveys(key, user.id);

  return {
    ...survey,
    questions: survey.questions.map(([ id1, id2 ]) => [
      getItem(id1),
      getItem(id2)
    ])
  };
};

export const getSessionData = async (key, { user }) => {
  const { accessToken, refreshToken } = user;
  const [userProfile, store, survey] = await Promise.all([
    getUserSessionData(key, user),
    getStoreSessionData(user),
    getTopPrioritySurvey(key, user)
  ]);
  return {
    user: userProfile,
    store,
    refreshToken,
    accessToken,
    survey
  };
};

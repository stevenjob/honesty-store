import { getUser } from '../services/user'
import { getTransactionHistory, getBalance } from '../services/transaction'
import { getItems } from '../services/store'
import { Transaction } from '../../../transaction/src/client/index';

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

const maskCardNumber = (cardNumber) => {
  if (cardNumber != null) {
    return cardNumber.replace(/\d(?=\d{4})/g, 'X');
  }
  return null;
};

const getUserSessionData = async (userID) => {
  const { cardDetails } = getUser(userID);
  const maskedCardNumber = maskCardNumber(cardDetails);
  const recentTransactions = (await getTransactionHistory(userID)).slice(0, 10);

  return {
    balance: await getBalance(userID),
    transactions: recentTransactions,
    cardNumber: maskedCardNumber,
  };
};

const getStoreSessionData = (userID) => {
  const { defaultStoreCode } = getUser(userID);
  return {
    items: getItems(defaultStoreCode),
    code: defaultStoreCode,
  };
};

export const getSessionData = async (userID) => {
  const response = {
    user: await getUserSessionData(userID),
    store: getStoreSessionData(userID),
  };
  return response;
};

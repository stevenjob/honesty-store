import { getUser } from '../services/user'
import { getTransactionHistory, getBalance } from '../services/transaction'
import { getItems } from '../services/store'

const maskCardNumber = (cardNumber) => {
  if (cardNumber != null) {
    return cardNumber.replace(/\d(?=\d{4})/g, 'X');
  }
  return null;
};

const getUserSessionData = (userID) => {
  const { cardDetails } = getUser(userID);
  const maskedCardNumber = maskCardNumber(cardDetails);
  const recentTransactions = getTransactionHistory(userID).slice(0, 10);

  return {
    balance: getBalance(userID),
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

export const getSessionData = (userID) => {
  const response = {
    user: getUserSessionData(userID),
    store: getStoreSessionData(userID),
  };
  return response;
};

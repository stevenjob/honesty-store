const { getUser } = require('../services/user');
const { getTransactionHistory, getBalance } = require('../services/transaction');
const { getItems } = require('../services/store');

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

const getSessionData = (userID) => {
  const response = {
    user: getUserSessionData(userID),
    store: getStoreSessionData(userID),
  };
  return response;
};

module.exports = getSessionData;

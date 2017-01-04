const { getCardNumber, getDefaultStoreCode } = require('../services/accounts');
const { getTransactionHistory, getBalance } = require('../services/transactions');
const { getItems } = require('../services/store');

const maskCardNumber = (cardNumber) => {
  if (cardNumber != null) {
    return cardNumber.replace(/\d(?=\d{4})/g, 'X');
  }
  return null;
};

const getUserSessionData = (userID) => {
  const cardNumber = getCardNumber(userID);
  const maskedCardNumber = maskCardNumber(cardNumber);
  return {
    balance: getBalance(userID),
    transactions: getTransactionHistory(userID),
    cardNumber: maskedCardNumber,
  };
};

const getStoreSessionData = (userID) => {
  const connectedStoreCode = getDefaultStoreCode(userID);
  return {
    items: getItems(connectedStoreCode),
    code: connectedStoreCode,
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

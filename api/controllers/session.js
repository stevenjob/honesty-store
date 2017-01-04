const HTTPStatus = require('http-status');
const { authenticateRefreshToken } = require('../middleware/authenticate');
const { getCardNumber, getDefaultStoreCode, getAccessToken } = require('../services/accounts');
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

const setupSessionEndpoint = (router) => {
  router.post(
    '/session',
    authenticateRefreshToken,
    (request, response) => {
      response.status(HTTPStatus.OK).json({
        response: {
          user: getUserSessionData(request.accountID),
          store: getStoreSessionData(request.accountID),
          accessToken: getAccessToken(request.accountID),
        },
      });
    });
};

module.exports = setupSessionEndpoint;

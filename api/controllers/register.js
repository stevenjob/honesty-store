const { registerAccount, updateAccount } = require('../services/accounts');
const HTTPStatus = require('http-status');
const { getPrice } = require('../services/store');
const { addItemTransaction, getBalance, getTransactionHistory } = require('../services/transactions');
const authenticate = require('../middleware/authenticate');
const validateEmail = require('../middleware/email-validator');

const register = (storeID) => {
  const { accessToken, refreshToken } = registerAccount(storeID);

  return {
    response: {
      refreshToken,
      accessToken,
      sessionData: {
        // Pulled from `/session` endpoint
      },
    },
  };
};

const register2 = (accountID, emailAddress, cardDetails, purchasedItemID) => {
  updateAccount(accountID, emailAddress, cardDetails);

  const price = getPrice(purchasedItemID);
  addItemTransaction(accountID, price);

  return {
    response: {
      balance: getBalance(accountID),
      transactions: getTransactionHistory(accountID),
    },
  };
};

const setupRegisterPhase1 = (router) => {
  router.post(
    '/register',
    (request, response) => {
      const { storeID } = request.body;
      const responseData = register(storeID);
      response.status(HTTPStatus.OK).json(responseData);
    });
};

const setupRegisterPhase2 = (router) => {
  router.post(
    '/register2',
    authenticate,
    validateEmail,
    (request, response) => {
      const { cardDetails, itemID } = request.body;
      const { accountID, emailAddress } = request;
      const responseData = register2(accountID, emailAddress, cardDetails, itemID);
      response.status(HTTPStatus.OK).json(responseData);
    });
};

const setupRegisterPhases = (router) => {
  setupRegisterPhase1(router);
  setupRegisterPhase2(router);
};

module.exports = setupRegisterPhases;

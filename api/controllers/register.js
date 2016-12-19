const { registerAccount, updateAccount } = require('../services/accounts');
const HTTPStatus = require('http-status');
const { getPrice } = require('../services/store');
const { addItemTransaction, getBalance, getTransactionHistory } = require('../services/transactions');
const { authenticate } = require('../middleware/authenticate');

const register = (storeID) => {
  // Create new account with default store ID
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
  // Call out to store service to retrieve price for given itemID
  const price = getPrice(purchasedItemID);
  // Transactions service will add new transaction
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
    (request, response) => {
      const { emailAddress, cardDetails, itemID } = request.body;
      const { accountID } = request;
      const responseData = register2(accountID, emailAddress, cardDetails, itemID);
      response.status(HTTPStatus.OK).json(responseData);
    });
};

const setupRegisterPhases = (router) => {
  setupRegisterPhase1(router);
  setupRegisterPhase2(router);
};

module.exports = setupRegisterPhases;

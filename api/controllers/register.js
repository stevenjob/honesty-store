const isEmail = require('validator/lib/isEmail');
const HTTPStatus = require('http-status');

const { registerAccount, updateAccount } = require('../services/accounts');
const { getPrice, getItems } = require('../services/store');
const { addItemTransaction, addTopUpTransaction, getBalance, getTransactionHistory } = require('../services/transactions');
const { authenticateAccessToken } = require('../middleware/authenticate');

const register = (storeCode) => {
  const { accessToken, refreshToken } = registerAccount(storeCode);

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
      const { storeCode } = request.body;
      const responseData = register(storeCode);
      response.status(HTTPStatus.OK).json(responseData);
    });
};

const setupRegisterPhase2 = (router) => {
  router.post(
    '/register2',
    authenticateAccessToken,
    (request, response) => {
      const emailAddress = request.body.emailAddress || '';
      if (!isEmail(emailAddress)) {
        response.status(HTTPStatus.UNAUTHORIZED)
          .json({
            error: {
              message: 'Invalid email address provided',
            },
          });
        return;
      }

      const { cardDetails, itemID } = request.body;
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

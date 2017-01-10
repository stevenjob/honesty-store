const isEmail = require('validator/lib/isEmail');
const HTTPStatus = require('http-status');
const winston = require('winston');

const { registerAccount, updateAccount } = require('../services/accounts');
const { getPrice } = require('../services/store');
const { addItemTransaction, addTopUpTransaction } = require('../services/transactions');
const getSessionData = require('../services/session');
const { authenticateAccessToken } = require('../middleware/authenticate');

const register = (storeCode) => {
  const { id, accessToken, refreshToken } = registerAccount(storeCode);

  const response = getSessionData(id);
  response.refreshToken = refreshToken;
  response.accessToken = accessToken;

  return { response };
};

const register2 = (userID, emailAddress, cardDetails, topUpAmount, purchasedItemID) => {
  updateAccount(userID, emailAddress, cardDetails);

  try {
    const price = getPrice(purchasedItemID);
    addTopUpTransaction(userID, topUpAmount);
    addItemTransaction(userID, price);
  } catch (e) {
    /* We don't want to fail if the item could not be purchased, however the client
    is expected to assert that a transaction exists for the item and alert the user
    appropriately if one doesn't. */
    winston.warn(e.message);
  }

  const response = getSessionData(userID);
  return { response };
};

const setupRegisterPhase1 = (router) => {
  router.post(
    '/register',
    (request, response) => {
      const { storeCode } = request.body;
      const responseData = register(storeCode);
      response.status(HTTPStatus.OK)
        .json(responseData);
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

      const { cardDetails, itemID, topUpAmount } = request.body;
      const { userID } = request;
      const responseData = register2(userID, emailAddress, cardDetails, topUpAmount, itemID);
      response.status(HTTPStatus.OK)
        .json(responseData);
    });
};

const setupRegisterPhases = (router) => {
  setupRegisterPhase1(router);
  setupRegisterPhase2(router);
};

module.exports = setupRegisterPhases;

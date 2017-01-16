import isEmail = require('validator/lib/isEmail');
import HTTPStatus = require('http-status');
import winston = require('winston');

import { registerUser, updateUser } from '../services/user';
import { getPrice } from '../services/store';
import { addItemTransaction, addTopUpTransaction } from '../services/transaction';
import { getSessionData } from '../services/session';
import { authenticateAccessToken } from '../middleware/authenticate';

const register = async (storeCode) => {
  const { id, accessToken, refreshToken } = registerUser(storeCode);

  const response: any = await getSessionData(id);
  response.refreshToken = refreshToken;
  response.accessToken = accessToken;

  return { response };
};

const register2 = async (userID, emailAddress, cardDetails, topUpAmount, purchasedItemID) => {
  updateUser(userID, emailAddress, cardDetails);

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

  const response = await getSessionData(userID);
  return { response };
};

const setupRegisterPhase1 = (router) => {
  router.post(
    '/register',
    (request, response) => {
      const { storeCode } = request.body;
      register(storeCode)
        .then((responseData) =>
            response.status(HTTPStatus.OK)
                .json(responseData))
        .catch((error) =>
            response.status(HTTPStatus.INTERNAL_SERVER_ERROR)
                .json({ error: error.message }))
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
      register2(userID, emailAddress, cardDetails, topUpAmount, itemID)
        .then((responseData) =>
          response.status(HTTPStatus.OK)
            .json(responseData))
        .catch((error) =>
          response.status(HTTPStatus.INTERNAL_SERVER_ERROR)
            .json({ error: error.message }));
    });
};

export default (router) => {
  setupRegisterPhase1(router);
  setupRegisterPhase2(router);
};

import isEmail = require('validator/lib/isEmail');
import HTTPStatus = require('http-status');
import winston = require('winston');
import uuid = require('uuid/v4');

import { createUser, updateUser } from '../../../user/src/client/index';
import { getPrice } from '../services/store';
import { addItemTransaction, addTopUpTransaction } from '../services/transaction';
import { getSessionData, SessionData } from '../services/session';
import { authenticateAccessToken } from '../middleware/authenticate';
import { promiseResponse } from '../../../service/src/endpoint-then-catch';
import { WithRefreshToken, WithAccessToken } from '../../../user/src/client/index';
import { storeCodeToStoreID } from '../services/store'

const registerUser = async (defaultStoreCode) => {
  const userId = uuid();
  const profile = {
    defaultStoreId: storeCodeToStoreID(defaultStoreCode),
  };
  return await createUser(userId, profile)
};

const register = async (storeCode) => {
  const { id, accessToken, refreshToken } = await registerUser(storeCode);

  return {
      ...await getSessionData(id),
      refreshToken,
      accessToken,
  };
};

const register2 = async (userID, emailAddress, topUpAmount, purchasedItemID) => {
  await updateUser(userID, { emailAddress });

  try {
    const price = getPrice(purchasedItemID);
    addTopUpTransaction(userID, topUpAmount);
    addItemTransaction(userID, price);
  } catch (e) {
    /* We don't want to fail if the item could not be purchased, however the client
    is expected to assert that a transaction exists for the item and alert the user
    appropriately if one doesn't. */
    winston.error(`couldn't purchase item ${purchasedItemID}`, e);
  }

  return await getSessionData(userID);
};

const setupRegisterPhase1 = (router) => {
  router.post(
    '/register',
    (request, response) => {
      const { storeCode } = request.body;

      type ResultType = SessionData & WithRefreshToken & WithAccessToken;

      promiseResponse<ResultType>(register(storeCode), response, HTTPStatus.INTERNAL_SERVER_ERROR);
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

      const { itemID, topUpAmount } = request.body;
      const { user: { id: userID } } = request;

      // FIXME: card details --> stripe token
      promiseResponse<SessionData>(
          register2(userID, emailAddress, topUpAmount, itemID),
          response,
          HTTPStatus.INTERNAL_SERVER_ERROR);
    });
};

export default (router) => {
  setupRegisterPhase1(router);
  setupRegisterPhase2(router);
};

import isEmail = require('validator/lib/isEmail');
import HTTPStatus = require('http-status');
import winston = require('winston');
import uuid = require('uuid/v4');

import { createUser, updateUser } from '../../../user/src/client/index';
import { createAccount, TransactionDetails, TransactionAndBalance } from '../../../transaction/src/client/index';
import { getPrice } from '../services/store';
import { addItemTransaction } from '../services/transaction';
import { getSessionData, SessionData } from '../services/session';
import { authenticateAccessToken } from '../middleware/authenticate';
import { promiseResponse } from '../../../service/src/endpoint-then-catch';
import { WithRefreshToken, WithAccessToken } from '../../../user/src/client/index';
import { storeCodeToStoreID } from '../services/store'
import { createTopup } from '../../../topup/src/client/index'

const register = async (storeCode) => {
  const userId = uuid();
  const accountId = uuid();
  const profile = {
    accountId,
    defaultStoreId: storeCodeToStoreID(storeCode),
  };
  const user = await createUser(userId, profile)
  const account = await createAccount(accountId);

  return {
      ...await getSessionData(user.id),
      refreshToken: user.refreshToken,
      accessToken: user.accessToken,
  };
};

/* createTopup() and addItemTransaction() return TransactionDetails, which don't have ids.
 * SessionData also has cardNumber.
 *
 * This is a copy of SessionData with TransactionDetails instead of Transaction
 * and cardNumber removed, to facilitate this for now */
interface SessionDataWithoutTransactionIds {
    user: {
        balance: number;
        transactions: TransactionDetails[];
    };
    store: {
        code: string;
        items: {
            id: string;
            name: string;
            price: number;
            count: number;
        }[];
    };
};

const register2 = async ({ userID, emailAddress, topUpAmount, itemID, stripeToken }) => {
  const sessionData = await getSessionData(userID);

  const user = await updateUser(userID, { emailAddress });

  const topup = await createTopup({ accountId: user.accountId, userId: user.id, amount: topUpAmount, stripeToken });

  let purchase: TransactionAndBalance = null;
  try {
    const price = getPrice(itemID);
    purchase = await addItemTransaction(userID, price);
  } catch (e) {
    /* We don't want to fail if the item could not be purchased, however the client
       is expected to assert that a transaction exists for the item and alert the user
       appropriately if one doesn't. */
    winston.error(`couldn't purchase item ${itemID}`, e);
  }

  return {
    ...sessionData,
    user: {
      ...user,
      balance: purchase == null ? topup.balance : purchase.balance,
      transactions: [
        ...(purchase != null ? [purchase.transaction] : []),
        topup.transaction,
        ...sessionData.user.transactions, // should be empty
      ],
    },
  };
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

      const { itemID, topUpAmount, stripeToken } = request.body;
      const { user: { id: userID } } = request;

      promiseResponse<SessionDataWithoutTransactionIds>(
          register2({ userID, emailAddress, topUpAmount, itemID, stripeToken }),
          response,
          HTTPStatus.INTERNAL_SERVER_ERROR);
    });
};

export default (router) => {
  setupRegisterPhase1(router);
  setupRegisterPhase2(router);
};

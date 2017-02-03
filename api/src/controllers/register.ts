import isEmail = require('validator/lib/isEmail');
import HTTPStatus = require('http-status');
import { error } from '../../../service/src/log';
import uuid = require('uuid/v4');

import { createUserKey } from '../../../service/src/key';
import { ServiceRouterCode } from '../../../service/src/router';
import { createTopup } from '../../../topup/src/client/index';
import { TransactionAndBalance } from '../../../transaction/src/client/index';
import { createUser, updateUser } from '../../../user/src/client/index';
import { authenticateAccessToken, noopAuthentication } from '../middleware/authenticate';
import { getSessionData } from '../services/session';
import { storeCodeToStoreID } from '../services/store';
import { purchase } from '../services/transaction';

const register = async (storeCode) => {
  const userId = uuid();
  const profile = {
    defaultStoreId: storeCodeToStoreID(storeCode)
  };
  const key = createUserKey({ userId });
  const user = await createUser(key, userId, profile);

  return await getSessionData(key, { user });
};

const register2 = async (key, { userID, emailAddress, topUpAmount, itemID, stripeToken }) => {
  const user = await updateUser(key, userID, { emailAddress });

  const topupTx = await createTopup(key, { accountId: user.accountId, userId: user.id, amount: topUpAmount, stripeToken });

  let purchaseTx: TransactionAndBalance = null;
  try {
    purchaseTx = await purchase({
      key,
      itemID,
      userID,
      quantity: 1,
      accountID: user.accountId,
      storeID: user.defaultStoreId
    });
  } catch (e) {
    /* We don't want to fail if the item could not be purchased, however the client
       is expected to assert that a transaction exists for the item and alert the user
       appropriately if one doesn't. */
    error(key, `couldn't purchase item ${itemID}`, e);
  }

  return {
    user: {
      ...user,
      balance: purchaseTx == null ? topupTx.balance : purchaseTx.balance,
      transactions: [
        ...(purchaseTx != null ? [purchaseTx.transaction] : []),
        topupTx.transaction
      ],
      cardDetails: topupTx.cardDetails
    }
  };
};

const setupRegisterPhase1 = (router) => {
  router.post(
    '/register',
    noopAuthentication,
    async (_key /* a new key is created instead */, _params, { storeCode }) => {
      try {
        return await register(storeCode);
      } catch (e) {
        throw new ServiceRouterCode(HTTPStatus.INTERNAL_SERVER_ERROR, e.message);
      }
    });
};

const setupRegisterPhase2 = (router) => {
  router.post(
    '/register2',
    authenticateAccessToken,
    async (key, _params, { itemID, topUpAmount, stripeToken, emailAddress = '' }, { user: { id: userID } }) => {
      if (!isEmail(emailAddress)) {
        throw new ServiceRouterCode(
          HTTPStatus.UNAUTHORIZED,
          'Invalid email address provided');
      }

      try {
        return await register2(key, { userID, emailAddress, topUpAmount, itemID, stripeToken });
      } catch (e) {
        throw new ServiceRouterCode(HTTPStatus.INTERNAL_SERVER_ERROR, e.message);
      }
    });
};

export default (router) => {
  setupRegisterPhase1(router);
  setupRegisterPhase2(router);
};

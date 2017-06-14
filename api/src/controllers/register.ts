import isEmail = require('validator/lib/isEmail');
import { error } from '@honesty-store/service/lib/log';
import { getStoreFromCode } from '@honesty-store/store';
import { createTopup } from '@honesty-store/topup';
import { TransactionAndBalance } from '@honesty-store/transaction';
import { createUser, updateUser } from '@honesty-store/user';
import { v4 as uuid } from 'uuid';

import { authenticateAccessToken, noopAuthentication } from '../middleware/authenticate';
import { getSessionData, getUserFeatures } from '../services/session';
import { purchase } from '../services/transaction';

const register = async (key, storeCode) => {
  const userId = uuid();
  const { id: defaultStoreId } = await getStoreFromCode(key, storeCode);
  const profile = {
    defaultStoreId
  };
  const user = await createUser(key, userId, profile);

  return await getSessionData(key, { user });
};

const register2 = async (key, { userID, emailAddress, topUpAmount, itemID, stripeToken }) => {
  const user = await updateUser(key, userID, { emailAddress });

  const topupTx = await createTopup(key, { accountId: user.accountId, userId: user.id, amount: topUpAmount, stripeToken });

  let purchaseTx: TransactionAndBalance = null;
  if (itemID != null) {
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
  }

  const sessionData = await getSessionData(key, { user });

  return {
    ...sessionData,
    user: {
      ...user,
      balance: purchaseTx == null ? topupTx.balance : purchaseTx.balance,
      transactions: [
        ...(purchaseTx != null ? [purchaseTx.transaction] : []),
        topupTx.transaction
      ],
      cardDetails: topupTx.cardDetails,
      features: getUserFeatures(user)
    }
  };
};

const setupRegisterPhase1 = (router) => {
  router.post(
    '/register',
    noopAuthentication,
    async (key, _params, { storeCode }) => await register(key, storeCode));
};

const setupRegisterPhase2 = (router) => {
  router.post(
    '/register2',
    authenticateAccessToken,
    async (key, _params, { itemID, topUpAmount, stripeToken, emailAddress = '' }, { user: { id: userID } }) => {
      if (!isEmail(emailAddress)) {
        throw new Error('Invalid email address provided');
      }

      return await register2(key, { userID, emailAddress, topUpAmount, itemID, stripeToken });
    });
};

export default (router) => {
  setupRegisterPhase1(router);
  setupRegisterPhase2(router);
};

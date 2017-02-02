import { authenticateAccessToken } from '../middleware/authenticate';
import { purchase } from '../services/transaction';

export default (router) => {
  router.post(
    '/purchase',
    authenticateAccessToken,
    async (key, _params, { itemID, quantity }, { user }) =>
      await purchase({
        key,
        itemID,
        userID: user.id,
        quantity,
        accountID: user.accountId,
        storeID: user.defaultStoreId
      })
  );
};

import { flagOutOfStock } from  '../../../box/src/client';
import { authenticateAccessToken } from '../middleware/authenticate';
import { storeBoxIds } from '../services/store';

const flagBoxItemOutOfStock = async (key, boxId, itemId) => {
  try {
    await flagOutOfStock({ key, boxId, itemId });
  } catch (e) {
    if (e.code !== 'ItemNotInBox') {
      throw e;
    }
    // ignore item-not-found
  }
};

// tslint:disable-next-line:export-name
export default (router) => {
  router.post(
    '/out-of-stock',
    authenticateAccessToken,
    async (key, _params, { itemId }, { user }) => {
      await Promise.all(
        storeBoxIds(user.defaultStoreId)
          .map(boxId => flagBoxItemOutOfStock(key, boxId, itemId)));

      return {};
    });
};

import { flagOutOfStock, getBox } from  '../../../box/src/client';
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

const itemInBox = (itemId) => ({ items }) => items.some(item => item.itemId === itemId);

// tslint:disable-next-line:export-name
export default (router) => {
  router.post(
    '/out-of-stock',
    authenticateAccessToken,
    async (key, _params, { itemId }, { user }) => {
      const boxes = await Promise.all(
        storeBoxIds(user.defaultStoreId)
          .map((boxId) => getBox(key, boxId)));

      const flagPromises = boxes
        .filter(itemInBox(itemId))
        .map(box => flagBoxItemOutOfStock(key, box.id, itemId));

      await Promise.all(flagPromises);

      return {};
    });
};

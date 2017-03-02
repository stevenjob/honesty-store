import { Box, flagOutOfStock, getBox } from  '../../../box/src/client';
import { authenticateAccessToken } from '../middleware/authenticate';
import { storeBoxIds } from '../services/store';

const itemInBox = (itemId) => ({ boxItems }: Box) => boxItems.some(item => item.itemID === itemId);

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
        .map(box => flagOutOfStock({ key, boxId: box.id, itemId }));

      await Promise.all(flagPromises);

      return {};
    });
};

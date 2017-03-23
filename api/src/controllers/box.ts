import { Box, flagOutOfStock, getBoxesForStore } from  '../../../box/src/client';
import { authenticateAccessToken } from '../middleware/authenticate';

const itemInBox = (itemId) => ({ boxItems }: Box) => boxItems.some(item => item.itemID === itemId);

// tslint:disable-next-line:export-name
export default (router) => {
  router.post(
    '/out-of-stock',
    authenticateAccessToken,
    async (key, _params, { itemId }, { user }) => {
      const boxes = await getBoxesForStore(key, user.defaultStoreId);

      const flagPromises = boxes
        .filter(itemInBox(itemId))
        .map(box => flagOutOfStock({ key, boxId: box.id, itemId }));

      await Promise.all(flagPromises);

      return {};
    });
};

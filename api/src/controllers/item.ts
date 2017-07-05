import { createItem, getAllItems, ItemDetails, updateItem } from '@honesty-store/item';
import { ExpressRouter } from '@honesty-store/service/lib/expressRouter';
import { authenticateAccessTokenAndStoreAdminUser } from '../middleware/authenticate';

// tslint:disable-next-line:export-name
export default (router: ExpressRouter) => {
  router.get(
    '/item/all',
    authenticateAccessTokenAndStoreAdminUser,
    async (key, _params, { }, { }) => await getAllItems(key)
  );

  router.post(
    '/item',
    authenticateAccessTokenAndStoreAdminUser,
    async (key, { }, details: ItemDetails, { }) => await createItem(key, details)
  );

  router.post(
    '/item/:itemId',
    authenticateAccessTokenAndStoreAdminUser,
    async (key, { itemId }, details: ItemDetails, { }) => await updateItem(key, itemId, details)
  );
};

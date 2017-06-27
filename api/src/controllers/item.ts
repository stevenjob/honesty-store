import { getAllItems, updateItem } from '@honesty-store/item';
import { ExpressRouter } from '@honesty-store/service/lib/expressRouter';
import { authenticateAccessTokenAndAdminUser } from '../middleware/authenticate';

// tslint:disable-next-line:export-name
export default (router: ExpressRouter) => {
  router.get(
    '/item/all',
    authenticateAccessTokenAndAdminUser,
    async (key, _params, { }, { }) => await getAllItems(key)
  );

  router.post(
    '/item/:itemId',
    authenticateAccessTokenAndAdminUser,
    async (key, { itemId }, details, { }) => await updateItem(key, itemId, details)
  );
};

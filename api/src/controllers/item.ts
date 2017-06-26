import { getAllItems, updateItem } from '@honesty-store/item';
import { ExpressRouter } from '@honesty-store/service/lib/expressRouter';
import { authenticateAccessToken } from '../middleware/authenticate';

const assertUserHasPermission = ({ id }) => {
  const allowedUserIds = [
    'f9c8b541-0a30-4adc-8e0d-887e6db9f301',
    '67b8dcc6-2f81-4fef-aa87-ecd9d22a11b1',
    'a8960624-7558-468c-9791-984ca0c620ba',
    'c71733c4-dc05-42f9-848e-fb53bf08a2d7'
  ];
  if (!allowedUserIds.some((el) => el === id)) {
    throw new Error(`userId ${id} does not have permission to view item details`);
  }
};

// tslint:disable-next-line:export-name
export default (router: ExpressRouter) => {
  router.get(
    '/item/all',
    authenticateAccessToken,
    async (key, _params, { }, { user }) => {
      assertUserHasPermission(user);
      return await getAllItems(key);
    }
  );

  router.post(
    '/item/:itemId',
    authenticateAccessToken,
    async (key, { itemId }, details, { user }) => {
      assertUserHasPermission(user);
      return await updateItem(key, itemId, details);
    }
  );
};

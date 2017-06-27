import { getStoreFromCode, listItem, Store, unlistItem, updateItemCount, updateItemDetails } from '@honesty-store/store';
import { updateUser, User } from '@honesty-store/user';
import { authenticateAccessToken, authenticateAccessTokenAndAdminUser } from '../middleware/authenticate';
import { getSessionData } from '../services/session';

const externaliseItem = (itemId: string, store: Store) => store.items.find(({ id }) => id === itemId);

export const updateDefaultStoreCode = async (key, userID, storeCode): Promise<User> => {
  const { id: defaultStoreId } = await getStoreFromCode(key, storeCode);
  return await updateUser(key, userID, { defaultStoreId });
};

export default (router) => {
  router.post(
    '/store',
    authenticateAccessToken,
    async (key, _params, { storeCode }, { user: { id: userId } }) => {
      const user = await updateDefaultStoreCode(key, userId, storeCode);
      return await getSessionData(key, { user });
    }
  );

  router.get(
    '/store/:storeCode/item/all',
    authenticateAccessToken,
    async (key, { storeCode }, { }, { }) => {
      const { items } = await getStoreFromCode(key, storeCode);
      return items;
    }
  );

  router.post(
    '/store/:storeCode/item/:itemId/unlist',
    authenticateAccessTokenAndAdminUser,
    async (key, { itemId, storeCode }, { }, { }) => {
      const { id: storeId } = await getStoreFromCode(key, storeCode);
      const store = await unlistItem(key, storeId, itemId);
      return externaliseItem(itemId, store);
    }
  );

  router.post(
    '/store/:storeCode/item/:itemId/list',
    authenticateAccessTokenAndAdminUser,
    async (key, { itemId, storeCode }, listing, { }) => {
      const { id: storeId } = await getStoreFromCode(key, storeCode);
      const storeItemListing = {
        id: itemId,
        ...listing
      };
      const store = await listItem(key, storeId, storeItemListing);
      return externaliseItem(itemId, store);
    }
  );

  router.post(
    '/store/:storeCode/item/:itemId/count',
    authenticateAccessTokenAndAdminUser,
    async (key, { itemId, storeCode }, { count }, { user: { id: userId } }) => {
      const { id: storeId } = await getStoreFromCode(key, storeCode);
      const store = await updateItemCount(key, storeId, itemId, count, userId);
      return externaliseItem(itemId, store);
    }
  );

  router.post(
    '/store/:storeCode/item/:itemId',
    authenticateAccessTokenAndAdminUser,
    async (key, { itemId, storeCode }, details, { }) => {
      const { id: storeId } = await getStoreFromCode(key, storeCode);
      const store = await updateItemDetails(key, storeId, itemId, details);
      return externaliseItem(itemId, store);
    }
  );
};

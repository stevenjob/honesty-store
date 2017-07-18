import { getStoreFromCode, listItem, relistItem, Store, unlistItem, updateItemCount, updateItemDetails } from '@honesty-store/store';
import { updateUser, User } from '@honesty-store/user';
import { authenticateAccessToken, authenticateAccessTokenAndStoreAdminUser } from '../middleware/authenticate';
import { getSessionData } from '../services/session';

const externaliseItem = (itemId: string, store: Store) => store.items.find(({ id }) => id === itemId);

export const updateDefaultStoreCode = async (key, userID, storeCode): Promise<User> => {
  const { id: defaultStoreId } = await getStoreFromCode(key, storeCode);
  return await updateUser(key, userID, { defaultStoreId });
};

export default (router) => {
  router.post(
    '/out-of-stock',
    authenticateAccessToken,
    async (key, _params, { itemId }, { user }) => {
      await updateItemCount(key, user.defaultStoreId, itemId, 0, user.id);
      return {};
    });

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
    authenticateAccessTokenAndStoreAdminUser,
    async (key, { storeCode }, { }, { }) => {
      const { items, revenue } = await getStoreFromCode(key, storeCode);
      return { items, revenue };
    }
  );

  router.post(
    '/store/:storeCode/item/:itemId/unlist',
    authenticateAccessTokenAndStoreAdminUser,
    async (key, { itemId, storeCode }, { }, { user: { id: userId } }) => {
      const { id: storeId } = await getStoreFromCode(key, storeCode);
      const store = await unlistItem(key, storeId, itemId, userId);
      return externaliseItem(itemId, store);
    }
  );

  router.post(
    '/store/:storeCode/item/:itemId/list',
    authenticateAccessTokenAndStoreAdminUser,
    async (key, { itemId, storeCode }, listing, { user: { id: userId } }) => {
      const { id: storeId } = await getStoreFromCode(key, storeCode);
      const storeItemListing = {
        id: itemId,
        ...listing
      };
      const store = await listItem(key, storeId, storeItemListing, userId);
      return externaliseItem(itemId, store);
    }
  );

  router.post(
    '/store/:storeCode/item/:itemId/relist',
    authenticateAccessTokenAndStoreAdminUser,
    async (key, { itemId, storeCode }, { additionalCount } , { user: { id: userId } }) => {
      const { id: storeId } = await getStoreFromCode(key, storeCode);
      const store = await relistItem(key, storeId, itemId, additionalCount, userId);
      return externaliseItem(itemId, store);
    }
  );

  router.post(
    '/store/:storeCode/item/:itemId/count',
    authenticateAccessTokenAndStoreAdminUser,
    async (key, { itemId, storeCode }, { count }, { user: { id: userId } }) => {
      const { id: storeId } = await getStoreFromCode(key, storeCode);
      const store = await updateItemCount(key, storeId, itemId, count, userId);
      return externaliseItem(itemId, store);
    }
  );

  router.post(
    '/store/:storeCode/item/:itemId',
    authenticateAccessTokenAndStoreAdminUser,
    async (key, { itemId, storeCode }, details, { user: { id: userId } }) => {
      const { id: storeId } = await getStoreFromCode(key, storeCode);
      const store = await updateItemDetails(key, storeId, itemId, details, userId);
      return externaliseItem(itemId, store);
    }
  );
};

import {
  getStoreFromCode,
  listItem,
  relistItem,
  Store,
  StoreItem as StoreItemInternal,
  unlistItem,
  updateItemCount,
  updateItemDetails
} from '@honesty-store/store';
import { getUser, updateUser, User } from '@honesty-store/user';
import { authenticateAccessToken, authenticateAccessTokenAndStoreAdminUser } from '../middleware/authenticate';
import { getSessionData } from '../services/session';
import { externaliseItem, StoreItem as StoreItemExternal } from '../services/store';

const lookupSellerEmail = async (key, sellerId: string) => {
  try {
    const { emailAddress } = await getUser(key, sellerId);
    return emailAddress;
  } catch (e) {
    if (e.message !== `Key not found ${sellerId}`) {
      throw e;
    }
    return `Unknown ${sellerId.slice(0, 6)}`;
  }
};

const getItem = async (key, itemId: string, { items }: Store): Promise<(StoreItemInternal & { sellerEmail: string }) | undefined> => {
  const item = items.find(({ id }) => id === itemId);
  if (item == null) {
    return;
  }
  const sellerEmail = await lookupSellerEmail(key, item.sellerId);
  return {
    ...item,
    sellerEmail
  };
};

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

      const itemsWithSellerEmailPromises = items.map(async (item) => {
        const sellerEmail = await lookupSellerEmail(key, item.sellerId);
        return {
          ...item,
          sellerEmail
        };
      });

      const revenueWithSellerEmailPromises = revenue.map(async bucket => {
        const sellerIdsAndEmails = await Promise.all(
          Object.keys(bucket.seller)
            .map(async id => ({
              id,
              email: await lookupSellerEmail(key, id)
            }))
        );
        const updatedSeller = {};
        for (const { id, email } of sellerIdsAndEmails) {
          updatedSeller[email] = bucket.seller[id];
        }
        return {
          ...bucket,
          seller: updatedSeller
        };
      });

      return {
        items: await Promise.all(itemsWithSellerEmailPromises),
        revenue: await Promise.all(revenueWithSellerEmailPromises)
      };
    }
  );

  router.post(
    '/store/:storeCode/item/:itemId/unlist',
    authenticateAccessTokenAndStoreAdminUser,
    async (key, { itemId, storeCode }, { }, { user: { id: userId } }) => {
      const { id: storeId } = await getStoreFromCode(key, storeCode);
      const store = await unlistItem(key, storeId, itemId, userId);
      return await getItem(key, itemId, store);
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
      return await getItem(key, itemId, store);
    }
  );

  router.post(
    '/store/:storeCode/item/:itemId/relist',
    authenticateAccessTokenAndStoreAdminUser,
    async (key, { itemId, storeCode }, { additionalCount }, { user: { id: userId } }) => {
      const { id: storeId } = await getStoreFromCode(key, storeCode);
      const store = await relistItem(key, storeId, itemId, additionalCount, userId);
      return await getItem(key, itemId, store);
    }
  );

  router.post(
    '/store/:storeCode/item/:itemId/count',
    authenticateAccessToken,
    async (key, { itemId, storeCode }, { count }, { user: { id: userId } }): Promise<StoreItemExternal> => {
      const { id: storeId } = await getStoreFromCode(key, storeCode);
      const store = await updateItemCount(key, storeId, itemId, count, userId);
      const item = await getItem(key, itemId, store);
      return externaliseItem(item, storeId, userId);
    }
  );

  router.post(
    '/store/:storeCode/item/:itemId/count/admin',
    authenticateAccessTokenAndStoreAdminUser,
    async (key, { itemId, storeCode }, { count }, { user: { id: userId } }): Promise<StoreItemInternal> => {
      const { id: storeId } = await getStoreFromCode(key, storeCode);
      const store = await updateItemCount(key, storeId, itemId, count, userId);
      return await getItem(key, itemId, store);
    }
  );

  router.post(
    '/store/:storeCode/item/:itemId',
    authenticateAccessTokenAndStoreAdminUser,
    async (key, { itemId, storeCode }, details, { user: { id: userId } }) => {
      const { id: storeId } = await getStoreFromCode(key, storeCode);
      const store = await updateItemDetails(key, storeId, itemId, details, userId);
      return await getItem(key, itemId, store);
    }
  );
};

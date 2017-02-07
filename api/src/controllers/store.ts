import { updateUser } from '../../../user/src/client/index';
import { authenticateAccessToken } from '../middleware/authenticate';
import { storeCodeToStoreID, storeItems } from '../services/store';

const updateDefaultStoreCode = async (key, userID, storeCode) => {
  return await updateUser(key, userID, { defaultStoreId: storeCodeToStoreID(storeCode) });
};

const updateStoreAndGetItems = async (key, userId, storeCode) => {
  await updateDefaultStoreCode(key, userId, storeCode);
  return storeItems(storeCode);
};

export default (router) => {
  router.post(
    '/store',
    authenticateAccessToken,
    async (key, _params, { storeCode }, { user }) => await updateStoreAndGetItems(key, user.id, storeCode));
};

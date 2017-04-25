import { updateUser } from '../../../user/src/client/index';
import { authenticateAccessToken } from '../middleware/authenticate';
import { getSessionData } from '../services/session';
import { storeCodeToStoreID } from '../services/store';

export const updateDefaultStoreCode = async (key, userID, storeCode) => {
  return await updateUser(key, userID, { defaultStoreId: storeCodeToStoreID(storeCode) });
};

const updateStoreAndGetItems = async (key, userId, storeCode) => {
  const user = await updateDefaultStoreCode(key, userId, storeCode);
  return await getSessionData(key, { user });
};

export default (router) => {
  router.post(
    '/store',
    authenticateAccessToken,
    async (key, _params, { storeCode }, { user }) => await updateStoreAndGetItems(key, user.id, storeCode));
};

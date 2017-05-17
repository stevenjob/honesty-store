import { getStoreFromCode } from '@honesty-store/store/src/client';
import { updateUser } from '@honesty-store/user/src/client/index';
import { authenticateAccessToken } from '../middleware/authenticate';
import { getSessionData } from '../services/session';

export const updateDefaultStoreCode = async (key, userID, storeCode) => {
  const { id: defaultStoreId } = await getStoreFromCode(key, storeCode);
  return await updateUser(key, userID, { defaultStoreId });
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

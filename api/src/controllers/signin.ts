import { tagKey } from '../../../service/src/key';
import { sendMagicLinkEmail } from '../../../user/src/client/index';
import { authenticateEmailToken, noopAuthentication } from '../middleware/authenticate';
import { getSessionData } from '../services/session';
import { updateDefaultStoreCode } from './store';

export const sendEmailToken = async (key, emailAddress, storeId) => {
  await sendMagicLinkEmail(tagKey(key, { emailAddress, storeId }), emailAddress, storeId);
  return {};
};

const setupSignInPhase1 = (router) => {
  router.post(
    '/signin',
    noopAuthentication,
    async (key, _params, { emailAddress, storeId }) => await sendEmailToken(key, emailAddress, storeId));
};

const setupSignInPhase2 = (router) => {
  router.post(
    '/signin2',
    authenticateEmailToken,
    async (key, _params, { storeId: storeCode }, { user }) => {
      if (storeCode) {
        await updateDefaultStoreCode(key, user.id, storeCode);
      }
      return await getSessionData(key, { user });
    });
};

export default (router) => {
  setupSignInPhase1(router);
  setupSignInPhase2(router);
};

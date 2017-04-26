import { tagKey } from '../../../service/src/key';
import { sendMagicLinkEmail } from '../../../user/src/client/index';
import { authenticateEmailToken, noopAuthentication } from '../middleware/authenticate';
import { getSessionData } from '../services/session';
import { updateDefaultStoreCode } from './store';

export const sendEmailToken = async (key, emailAddress, storeCode) => {
  await sendMagicLinkEmail(tagKey(key, { emailAddress, storeCode }), emailAddress, storeCode);
  return {};
};

const setupSignInPhase1 = (router) => {
  router.post(
    '/signin',
    noopAuthentication,
    async (key, _params, { emailAddress, storeCode }) => await sendEmailToken(key, emailAddress, storeCode));
};

const setupSignInPhase2 = (router) => {
  router.post(
    '/signin2',
    authenticateEmailToken,
    async (key, _params, { storeCode }, { user }) => {
      let updatedUser = user;
      if (storeCode) {
        updatedUser = {
          ...user,
          ...(await updateDefaultStoreCode(key, user.id, storeCode))
        };
      }
      return await getSessionData(key, { user: updatedUser });
    });
};

export default (router) => {
  setupSignInPhase1(router);
  setupSignInPhase2(router);
};

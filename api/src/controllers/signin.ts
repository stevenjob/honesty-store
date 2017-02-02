import HTTPStatus = require('http-status');
import { createEmailKey } from '../../../service/src/key';
import { ServiceRouterCode } from '../../../service/src/router';
import { sendMagicLinkEmail } from '../../../user/src/client/index';
import { authenticateEmailToken } from '../middleware/authenticate';
import { getSessionData } from '../services/session';

export const sendEmailToken = async (emailAddress) => {
  await sendMagicLinkEmail(createEmailKey({ emailAddress }), emailAddress);
  return {};
};

const setupSignInPhase1 = (router) => {
  router.post(
    '/signin',
    async (_key, _params, { emailAddress }) => await sendEmailToken(emailAddress));
};

const setupSignInPhase2 = (router) => {
  router.post(
    '/signin2',
    authenticateEmailToken,
    async (key, _params, _body, { user }) => {
      try {
        return await getSessionData(key, { user });
      } catch (e) {
        throw new ServiceRouterCode(HTTPStatus.INTERNAL_SERVER_ERROR, e.message);
      }
    });
};

export default (router) => {
  setupSignInPhase1(router);
  setupSignInPhase2(router);
};

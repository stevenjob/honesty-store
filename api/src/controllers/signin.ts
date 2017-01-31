import HTTPStatus = require('http-status');
import { createEmailKey } from '../../../service/src/key';
import { promiseResponse } from '../../../service/src/promiseResponse';
import { sendMagicLinkEmail, WithRefreshToken } from '../../../user/src/client/index';
import { authenticateEmailToken } from '../middleware/authenticate';
import { getSessionData, SessionData } from '../services/session';

export const sendEmailToken = async (emailAddress) => {
  await sendMagicLinkEmail(createEmailKey({ emailAddress }), emailAddress);
  return {};
};

const setupSignInPhase1 = (router) => {
  router.post(
    '/signin',
    (request, response) => {
      const { emailAddress } = request.body;
      promiseResponse<{}>(
          sendEmailToken(emailAddress),
          request,
          response,
          HTTPStatus.OK);
    });
};

const setupSignInPhase2 = (router) => {
  router.post(
    '/signin2',
    authenticateEmailToken,
    (request, response) => {
      const { key } = request;

      promiseResponse<SessionData & WithRefreshToken>(
          getSessionData(key, { user: request.user }),
          request,
          response,
          HTTPStatus.INTERNAL_SERVER_ERROR);
    });
};

export default (router) => {
  setupSignInPhase1(router);
  setupSignInPhase2(router);
};

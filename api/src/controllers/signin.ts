import HTTPStatus = require('http-status');
import winston = require('winston');
import { getSessionData, SessionData } from '../services/session';
import { authenticateEmailToken } from '../middleware/authenticate'
import { promiseResponse } from '../../../service/src/endpoint-then-catch';
import { WithRefreshToken, sendMagicLinkEmail } from '../../../user/src/client/index';
import { createEmailKey } from '../../../service/src/key';

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
          request.key,
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
          key,
          response,
          HTTPStatus.INTERNAL_SERVER_ERROR);
    });
};

export default (router) => {
  setupSignInPhase1(router);
  setupSignInPhase2(router);
};

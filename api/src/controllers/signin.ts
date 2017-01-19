import HTTPStatus = require('http-status');
import { sendEmailToken, updateRefreshToken } from '../services/user'
import { getSessionData, SessionData } from '../services/session';
import { authenticateEmailToken } from '../middleware/authenticate'
import { promiseResponse } from '../../../service/src/endpoint-then-catch';
import { WithRefreshToken } from '../../../user/src/client/index';

const setupSignInPhase1 = (router) => {
  router.post(
    '/signin',
    (request, response) => {
      const { emailAddress } = request.body;
      sendEmailToken(emailAddress);
      response.status(HTTPStatus.OK)
        .json({ response: {} });
    });
};

const signin2 = async (userID) => {
    const sessionData = await getSessionData(userID);
    const { refreshToken } = updateRefreshToken(userID); // this is gonna get rebased to oblivion

    return {
        ...sessionData,
        refreshToken
    };
}

const setupSignInPhase2 = (router) => {
  router.post(
    '/signin2',
    authenticateEmailToken,
    (request, response) => {
      promiseResponse<SessionData & WithRefreshToken>(
          signin2(request.userID),
          response,
          HTTPStatus.INTERNAL_SERVER_ERROR);
    });
};

export default (router) => {
  setupSignInPhase1(router);
  setupSignInPhase2(router);
};

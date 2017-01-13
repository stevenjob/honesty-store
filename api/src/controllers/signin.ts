import HTTPStatus = require('http-status');
import { sendEmailToken, updateRefreshToken } from '../services/user'
import { getSessionData } from '../services/session'
import { authenticateEmailToken } from '../middleware/authenticate'

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

const setupSignInPhase2 = (router) => {
  router.post(
    '/signin2',
    authenticateEmailToken,
    (request, response) => {
      const responseData: any = getSessionData(request.userID);

      const { refreshToken } = updateRefreshToken(request.userID);
      responseData.refreshToken = refreshToken;

      response.status(HTTPStatus.OK)
        .json({ response: responseData });
    });
};

export default (router) => {
  setupSignInPhase1(router);
  setupSignInPhase2(router);
};

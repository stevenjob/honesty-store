const HTTPStatus = require('http-status');
const { sendEmailToken, updateRefreshToken } = require('../services/accounts');
const getSessionData = require('../services/session');
const { authenticateEmailToken } = require('../middleware/authenticate');

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
      const responseData = getSessionData(request.userID);

      const { refreshToken } = updateRefreshToken(request.userID);
      responseData.refreshToken = refreshToken;

      response.status(HTTPStatus.OK)
        .json({ response: responseData });
    });
};

const setupSignInPhases = (router) => {
  setupSignInPhase1(router);
  setupSignInPhase2(router);
};

module.exports = setupSignInPhases;

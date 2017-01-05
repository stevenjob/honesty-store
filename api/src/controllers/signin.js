const HTTPStatus = require('http-status');
const { sendEmailToken, getAccountIDFromEmailToken, updateRefreshToken } = require('../services/accounts');
const getSessionData = require('../services/session');

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
    (request, response) => {
      const { emailToken } = request.body;

      try {
        const accountID = getAccountIDFromEmailToken(emailToken);
        const responseData = getSessionData(accountID);
        responseData.refreshToken = updateRefreshToken(accountID);

        response.status(HTTPStatus.OK)
          .json({ response: responseData });
      } catch (e) {
        response.status(HTTPStatus.UNAUTHORIZED).json({
          error: {
            message: 'Invalid token provided',
          },
        });
      }
    });
};

const setupSignInPhases = (router) => {
  setupSignInPhase1(router);
  setupSignInPhase2(router);
};

module.exports = setupSignInPhases;

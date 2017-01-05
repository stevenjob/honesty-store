const HTTPStatus = require('http-status');
const { sendEmailToken, getAccountIDFromEmailToken } = require('../services/accounts');

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
        // Update refresh token and send as part of response
        response.status(HTTPStatus.OK).send({
          response: {
            refreshToken: '',
            session: {},
          },
        });
      } catch (e) {
        response.status(HTTPStatus.UNAUTHORIZED).send({
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

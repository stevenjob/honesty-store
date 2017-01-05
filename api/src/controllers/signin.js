const HTTPStatus = require('http-status');
const { sendEmailToken } = require('../services/accounts');

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

const setupSignInPhases = (router) => {
  setupSignInPhase1(router);
};

module.exports = setupSignInPhases;

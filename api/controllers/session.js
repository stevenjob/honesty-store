const HTTPStatus = require('http-status');
const { authenticateRefreshToken } = require('../middleware/authenticate');
const { getAccessToken } = require('../services/accounts');
const getSessionData = require('../services/session');

const setupSessionEndpoint = (router) => {
  router.post(
    '/session',
    authenticateRefreshToken,
    (request, response) => {
      const sessionResponse = getSessionData(request.accountID);
      sessionResponse.accessToken = getAccessToken(request.accountID);
      response.status(HTTPStatus.OK)
        .json({ response: sessionResponse });
    });
};

module.exports = setupSessionEndpoint;

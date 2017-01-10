const HTTPStatus = require('http-status');
const { authenticateRefreshToken } = require('../middleware/authenticate');
const { updateAccessToken } = require('../services/accounts');
const getSessionData = require('../services/session');

const setupSessionEndpoint = (router) => {
  router.post(
    '/session',
    authenticateRefreshToken,
    (request, response) => {
      const sessionResponse = getSessionData(request.userID);

      const { accessToken } = updateAccessToken(request.userID);

      sessionResponse.accessToken = accessToken;
      response.status(HTTPStatus.OK)
        .json({ response: sessionResponse });
    });
};

module.exports = setupSessionEndpoint;

const HTTPStatus = require('http-status');
const { authenticateAccessToken } = require('../middleware/authenticate');
const { expireRefreshToken } = require('../services/accounts');

const setupLogOutEndpoint = (router) => {
  router.post(
    '/logout',
    authenticateAccessToken,
    (req, res) => {
      expireRefreshToken(req.accountID);
      res.status(HTTPStatus.OK)
        .json({ response: {} });
    });
};

module.exports = setupLogOutEndpoint;

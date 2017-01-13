import HTTPStatus = require('http-status');
const { authenticateAccessToken } = require('../middleware/authenticate');
const { expireRefreshToken } = require('../services/user');

const setupLogOutEndpoint = (router) => {
  router.post(
    '/logout',
    authenticateAccessToken,
    (req, res) => {
      expireRefreshToken(req.userID);
      res.status(HTTPStatus.OK)
        .json({ response: {} });
    });
};

module.exports = setupLogOutEndpoint;

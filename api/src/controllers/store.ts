const HTTPStatus = require('http-status');
const { authenticateAccessToken } = require('../middleware/authenticate');
const { updateDefaultStoreCode } = require('../services/user');
const { getItems } = require('../services/store');

const setupStoreEndpoint = (router) => {
  router.post(
    '/store',
    authenticateAccessToken,
    (req, res) => {
      const storeCode = req.body.storeCode;
      updateDefaultStoreCode(req.userID, req.body.storeCode);
      res.status(HTTPStatus.OK)
        .json({ response: getItems(storeCode) });
    });
};

module.exports = setupStoreEndpoint;

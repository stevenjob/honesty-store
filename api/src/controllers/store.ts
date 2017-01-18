import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate'
import { updateDefaultStoreCode } from '../services/user'
import { getItems } from '../services/store'

export default (router) => {
  router.post(
    '/store',
    authenticateAccessToken,
    (req, res) => {
      const storeCode = req.body.storeCode;
      updateDefaultStoreCode(req.user.id, storeCode)
        .then((user) => {
          req.user = user;
          res.status(HTTPStatus.OK)
            .json({ response: getItems(storeCode) })
        })
        .catch((error) =>
          res.status(HTTPStatus.OK)
            .json({ error: error.message }))
    });
};

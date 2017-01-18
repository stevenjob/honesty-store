import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate'
import { updateUser } from '../../../user/src/client/index';
import { getItems, storeCodeToStoreID } from '../services/store'

const updateDefaultStoreCode = async (userID, storeCode) => {
  return await updateUser(userID, { defaultStoreId: storeCodeToStoreID(storeCode) });
};

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

import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate'
import { updateUser } from '../../../user/src/client/index';
import { getItems, storeCodeToStoreID } from '../services/store'
import { promiseResponse } from '../../../service/src/endpoint-then-catch';

interface Item {
    id: string;
    name: string;
    price: number;
};

type ItemAndCount = Item & { count: number };

const updateDefaultStoreCode = async (key, userID, storeCode) => {
  return await updateUser(key, userID, { defaultStoreId: storeCodeToStoreID(storeCode) });
};

const updateStoreAndGetItems = async (key, userId, storeCode) => {
    await updateDefaultStoreCode(key, userId, storeCode);
    return getItems(storeCode);
};

export default (router) => {
  router.post(
    '/store',
    authenticateAccessToken,
    (req, res) => {
      const { storeCode } = req.body;
      const { key } = req;

      promiseResponse<ItemAndCount[]>(
          updateStoreAndGetItems(key, req.user.id, storeCode),
          req,
          res,
          HTTPStatus.OK);
    });
};

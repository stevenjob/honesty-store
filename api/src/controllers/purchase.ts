import { authenticateAccessToken } from '../middleware/authenticate';
import { getPrice } from '../services/store';
import { addItemTransaction, getBalance } from '../services/transaction';
import { promiseResponse } from '../../../service/src/endpoint-then-catch';
import { TransactionAndBalance } from '../../../transaction/src/client/index';

const purchase = async ({ itemID, userID }) => {
    const price = getPrice(itemID);
    return await addItemTransaction(userID, price);
};

export default (router) => {
  router.post(
    '/purchase',
    authenticateAccessToken,
    (request, response) => {
      const { itemID } = request.body;
      const { user: { id: userID } } = request;

      promiseResponse<TransactionAndBalance>(
          purchase({ itemID, userID }),
          response);
    });
};

import { authenticateAccessToken } from '../middleware/authenticate';
import { getPrice } from '../services/store';
import { addItemTransaction, getBalance } from '../services/transaction';
import { promiseResponse } from '../../../service/src/endpoint-then-catch';
import { TransactionAndBalance } from '../../../transaction/src/client/index';

const purchase = async ({ itemID, userID }) => {
    const price = getPrice(itemID);
    const { transaction, balance } = await addItemTransaction(userID, price);

    return {
      balance,
      transaction,
    };
};

export default (router) => {
  router.post(
    '/purchase',
    authenticateAccessToken,
    (request, response) => {
      const { itemID, userID } = request.body;

      promiseResponse<{ balance: number, transaction: TransactionAndBalance}>(
          purchase({ itemID, userID }),
          response);
    });
};

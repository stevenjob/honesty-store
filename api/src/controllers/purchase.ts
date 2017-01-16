import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate';
import { getPrice } from '../services/store';
import { addItemTransaction, getBalance } from '../services/transaction';

export default (router) => {
  router.post(
    '/purchase',
    authenticateAccessToken,
    (request, response) => {
      const { itemID } = request.body;

      try {
        const price = getPrice(itemID);
        const transaction = addItemTransaction(request.userID, price);

        getBalance(request.userID)
            .then((balance) => {
                const responseData = {
                    balance,
                    transaction,
                };
                response.status(HTTPStatus.OK)
                .json({ response: responseData });
            });
      } catch (e) {
        response.status(HTTPStatus.OK)
          .json({
            error: {
              message: e.message,
            },
          });
      }
    });
};

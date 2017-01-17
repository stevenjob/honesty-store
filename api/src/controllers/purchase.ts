import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate';
import { getPrice } from '../services/store';
import { addItemTransaction, getBalance } from '../services/transaction';

const attemptPurchase = async ({ userID, itemID }) => {
    const price = getPrice(itemID);
    const transaction = await addItemTransaction(userID, price);

    const balance = await getBalance(userID);

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

      attemptPurchase({ itemID, userID })
        .then(({ balance, transaction }) => {
            response.status(HTTPStatus.OK)
                .json({ response: { balance, transaction }});
        })
        .catch((error) => {
            response.status(HTTPStatus.OK)
                .json({ error: error.message });
        });
    });
};

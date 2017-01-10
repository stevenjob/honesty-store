const HTTPStatus = require('http-status');
const { authenticateAccessToken } = require('../middleware/authenticate');
const { getPrice } = require('../services/store');
const { addItemTransaction, getBalance } = require('../services/transaction');

const setupPurchaseEndpoint = (router) => {
  router.post(
    '/purchase',
    authenticateAccessToken,
    (request, response) => {
      const { itemID } = request.body;

      try {
        const price = getPrice(itemID);
        const transaction = addItemTransaction(request.userID, price);
        const responseData = {
          balance: getBalance(request.userID),
          transaction,
        };
        response.status(HTTPStatus.OK)
          .json({ response: responseData });
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

module.exports = setupPurchaseEndpoint;

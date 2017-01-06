const HTTPStatus = require('http-status');
const { authenticateAccessToken } = require('../middleware/authenticate');
const { getPrice } = require('../services/store');
const { addItemTransaction, getBalance } = require('../services/transactions');

const setupPurchaseEndpoint = (router) => {
  router.post(
    '/purchase',
    authenticateAccessToken,
    (request, response) => {
      const { itemID } = request.body;

      try {
        const price = getPrice(itemID);
        const transaction = addItemTransaction(request.accountID, price);
        const responseData = {
          balance: getBalance(request.accountID),
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

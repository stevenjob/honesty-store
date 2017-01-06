const HTTPStatus = require('http-status');
const { authenticateAccessToken } = require('../middleware/authenticate');
const { getBalance, addTopUpTransaction } = require('../services/transactions');
const { updateCardDetails } = require('../services/accounts');

const setupTopUpEndpoint = (router) => {
  router.post(
    '/topup',
    authenticateAccessToken,
    (request, response) => {
      const { cardDetails, amount } = request.body;

      updateCardDetails(request.accountID, cardDetails);
      addTopUpTransaction(request.accountID, amount);

      response.status(HTTPStatus.OK)
        .json({
          response: {
            balance: getBalance(request.accountID),
          },
        });
    });
};

module.exports = setupTopUpEndpoint;

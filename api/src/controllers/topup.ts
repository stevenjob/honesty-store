import HTTPStatus = require('http-status');
const { authenticateAccessToken } = require('../middleware/authenticate');
const { getBalance, addTopUpTransaction } = require('../services/transaction');
const { updateCardDetails } = require('../services/user');

const setupTopUpEndpoint = (router) => {
  router.post(
    '/topup',
    authenticateAccessToken,
    (request, response) => {
      const { cardDetails, amount } = request.body;

      updateCardDetails(request.userID, cardDetails);
      addTopUpTransaction(request.userID, amount);

      response.status(HTTPStatus.OK)
        .json({
          response: {
            balance: getBalance(request.userID),
          },
        });
    });
};

module.exports = setupTopUpEndpoint;

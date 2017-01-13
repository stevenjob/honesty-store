import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate'
import { getBalance, addTopUpTransaction } from '../services/transaction'
import { updateCardDetails } from '../services/user'

export default (router) => {
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

import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate'
import { getUser } from '../../../user/src/client/index';
import { createTopup } from '../../../topup/src/client/index'
import { promiseResponse } from '../../../service/src/endpoint-then-catch';
import { TransactionAndBalance } from '../../../transaction/src/client/index';

export default (router) => {
  router.post(
    '/topup',
    authenticateAccessToken,
    (request, response) => {
      const { stripeToken, amount } = request.body;
      const { key } = request;

      promiseResponse<TransactionAndBalance>(
          createTopup(
              key,
              {
                  stripeToken,
                  amount,
                  userId: request.user.id,
                  accountId: request.user.accountId
              }),
          key,
          response,
          HTTPStatus.INTERNAL_SERVER_ERROR);
    })
};

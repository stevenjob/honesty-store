import HTTPStatus = require('http-status');
import { promiseResponse } from '../../../service/src/promiseResponse';
import { createTopup, TopupResponse } from '../../../topup/src/client/index';
import { authenticateAccessToken } from '../middleware/authenticate';

export default (router) => {
  router.post(
    '/topup',
    authenticateAccessToken,
    (request, response) => {
      const { stripeToken, amount } = request.body;
      const { key } = request;

      promiseResponse<TopupResponse>(
          createTopup(
              key,
              {
                  stripeToken,
                  amount,
                  userId: request.user.id,
                  accountId: request.user.accountId
              }),
          request,
          response,
          HTTPStatus.INTERNAL_SERVER_ERROR);
    });
};

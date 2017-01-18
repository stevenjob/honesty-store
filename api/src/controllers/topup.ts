import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate'
import { getUser } from '../../../user/src/client/index';
import { createTopup } from '../../../topup/src/client/index'
import { promiseResponse } from '../../../service/src/endpoint-then-catch';
import { TransactionAndBalance } from '../../../transaction/src/client/index';

const performTopup = async ({ stripeToken, amount, userId }: { stripeToken: string, amount: number, userId: string }) => {
    const accountId = (await getUser(userId)).accountId;

    return await createTopup({ accountId, userId, amount, stripeToken });
};

export default (router) => {
  router.post(
    '/topup',
    authenticateAccessToken,
    (request, response) => {
      const { stripeToken, amount } = request.body;

      promiseResponse<TransactionAndBalance>(
          performTopup({ stripeToken, amount, userId: request.user.id }),
          response,
          HTTPStatus.INTERNAL_SERVER_ERROR);
    })
};

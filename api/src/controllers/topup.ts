import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate'
import { getUsersAccountId } from '../services/user';
import { createTopup } from '../../../topup/src/client/index'

const performTopup = async ({ stripeToken, amount, userId }: { stripeToken: string, amount: number, userId: string }) => {
    const accountId = await getUsersAccountId(userId);

    return await createTopup({ accountId, userId, amount, stripeToken });
};

export default (router) => {
  router.post(
    '/topup',
    authenticateAccessToken,
    (request, response) => {
      const { stripeToken, amount } = request.body;

      performTopup({ stripeToken, amount, userId: request.userId })
        .then((topupJson) =>
          response.status(HTTPStatus.OK)
            .json(topupJson)
        )
        .catch((error) =>
          response.status(HTTPStatus.INTERNAL_SERVER_ERROR)
            .json({ error: error.message })
        );
    })
};

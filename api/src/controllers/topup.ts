import HTTPStatus = require('http-status');
import { ServiceRouterCode } from '../../../service/src/router';
import { createTopup } from '../../../topup/src/client/index';
import { authenticateAccessToken } from '../middleware/authenticate';

export default (router) => {
  router.post(
    '/topup',
    authenticateAccessToken,
    async (key, _params, { stripeToken, amount }, { user }) => {
      try {
        return await createTopup(
          key,
          {
            stripeToken,
            amount,
            userId: user.id,
            accountId: user.accountId
          });
      } catch (e) {
        throw new ServiceRouterCode(HTTPStatus.INTERNAL_SERVER_ERROR, e.message);
      }
    });
};

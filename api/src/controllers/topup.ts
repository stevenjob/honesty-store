import { v4 as uuid } from 'uuid';
import { authenticateAccessToken } from '../middleware/authenticate';
import { topup } from '../services/topup';

export default (router) => {
  router.post(
    '/topup',
    authenticateAccessToken,
    async (key, _params, { stripeToken, amount }, { user }) =>
      await topup(
        key,
        {
          id: uuid(),
          stripeToken,
          amount,
          userId: user.id,
          accountId: user.accountId
        }));
};

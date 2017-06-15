import { createTopup } from '@honesty-store/topup';
import { authenticateAccessToken } from '../middleware/authenticate';

export default (router) => {
  router.post(
    '/topup',
    authenticateAccessToken,
    async (key, _params, { stripeToken, amount }, { user }) =>
      await createTopup(
        key,
        {
          stripeToken,
          amount,
          userId: user.id,
          accountId: user.accountId
        }));
};

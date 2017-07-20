import { createTopup } from '@honesty-store/topup';
import { authenticateAccessToken } from '../middleware/authenticate';
import { v4 as uuid } from 'uuid';

export default (router) => {
  router.post(
    '/topup',
    authenticateAccessToken,
    async (key, _params, { stripeToken, amount }, { user }) =>
      await createTopup(
        key,
        {
          id: uuid(),
          stripeToken,
          amount,
          userId: user.id,
          accountId: user.accountId
        }));
};

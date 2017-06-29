import { addCard } from '@honesty-store/topup';
import { authenticateAccessToken } from '../middleware/authenticate';

export default (router) => {
  router.post(
    '/new-card',
    authenticateAccessToken,
    async (key, _params, { stripeToken }, { user }) =>
      await addCard(key, { stripeToken, accountId: user.accountId, userId: user.id }));
};

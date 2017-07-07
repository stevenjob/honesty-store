import { createTopup } from '@honesty-store/topup';
import { authenticateAccessToken } from '../middleware/authenticate';

const addCard = async (key, { stripeToken, accountId, userId }) => {
  const { cardDetails } = await createTopup(key, { stripeToken, accountId, userId, amount: 0 });
  return cardDetails;
};

export default (router) => {
  router.post(
    '/new-card',
    authenticateAccessToken,
    async (key, _params, { stripeToken }, { user }) =>
      await addCard(key, { stripeToken, accountId: user.accountId, userId: user.id }));
};

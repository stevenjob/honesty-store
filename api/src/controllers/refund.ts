import { authenticateAccessToken } from '../middleware/authenticate';
import { refund } from '../services/transaction';

export default (router) => {
  router.post(
    '/refund/:transactionId',
    authenticateAccessToken,
    async (key, { transactionId }, { reason }, { user }) =>
    refund({
      key,
      transactionId,
      userId: user.id,
      reason
    })
  );
};

import { authenticateAccessToken } from '../middleware/authenticate';
import { getExpandedTransactionsAndBalance } from '../services/transaction';

export default (router) => {
  router.get(
    '/transactions',
    authenticateAccessToken,
    async (key, _params, _body, { query, user }) => {
      const page = parseInt(query.page, 10) || 0;

      return await getExpandedTransactionsAndBalance({ key, accountID: user.accountId, page });
    });
};

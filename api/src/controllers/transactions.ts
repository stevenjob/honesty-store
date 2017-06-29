import { authenticateAccessToken } from '../middleware/authenticate';
import { getExpandedTransactionsAndAccount } from '../services/transaction';

export default (router) => {
  router.get(
    '/transactions',
    authenticateAccessToken,
    async (key, _params, _body, { query, user }) => {
      const page = parseInt(query.page, 10) || 0;

      return await getExpandedTransactionsAndAccount({ key, accountID: user.accountId, page });
    });
};

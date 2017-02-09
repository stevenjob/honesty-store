import HTTPStatus = require('http-status');
import { ServiceRouterCode } from '../../../service/src/router';
import { authenticateAccessToken } from '../middleware/authenticate';
import { getExpandedTransactionsAndBalance } from '../services/transaction';

export default (router) => {
  router.get(
    '/transactions',
    authenticateAccessToken,
    async (key, _params, _body, { query, user }) => {
      const page = parseInt(query.page, 10) || 0;

      try {
        return await getExpandedTransactionsAndBalance({ key, accountID: user.accountId, page });
      } catch (e) {
        throw new ServiceRouterCode(HTTPStatus.INTERNAL_SERVER_ERROR, e.message);
      }
    });
};

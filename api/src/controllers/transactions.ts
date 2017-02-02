import HTTPStatus = require('http-status');
import { ServiceRouterCode } from '../../../service/src/router';
import { authenticateAccessToken } from '../middleware/authenticate';
import { getTransactionHistory } from '../services/transaction';

const getPagedTransactions = async ({ key, accountID, page }) => {
  const allUserTransactions = await getTransactionHistory({ key, accountID });
  const transactionsPerPage = 10;

  const lastPage = Math.max(
    Math.ceil(allUserTransactions.length / transactionsPerPage) - 1,
    0);

  const startIndex = transactionsPerPage * page;
  const endIndex = Math.min(startIndex + transactionsPerPage, allUserTransactions.length);
  const items = allUserTransactions.slice(startIndex, endIndex);

  return { items, lastPage };
};

export default (router) => {
  router.get(
    '/transactions',
    authenticateAccessToken,
    async (key, _params, _body, { query, user }) => {
      const page = parseInt(query.page, 10) || 0;

      try {
        return await getPagedTransactions({ key, accountID: user.accountId, page });
      } catch (e) {
        throw new ServiceRouterCode(HTTPStatus.INTERNAL_SERVER_ERROR, e.message);
      }
    });
};

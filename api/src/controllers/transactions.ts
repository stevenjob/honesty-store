import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate'
import { getTransactionHistory } from '../services/transaction'
import { promiseResponse } from '../../../service/src/endpoint-then-catch';
import { Transaction } from '../../../transaction/src/client/index';

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
    (request, response) => {
      const page = parseInt(request.query.page, 10) || 0;
      const { key } = request;

      promiseResponse<{ lastPage: number, items: Transaction[] }>(
        getPagedTransactions({ key, accountID: request.user.accountId, page }),
        request,
        response,
        HTTPStatus.INTERNAL_SERVER_ERROR);
    });
};

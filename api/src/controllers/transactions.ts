import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate'
import { getTransactionHistory } from '../services/transaction'

const getPagedTransactions = async (userID, page) => {
  const allUserTransactions = await getTransactionHistory(userID);
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

      getPagedTransactions(request.userID, page)
        .then((pagedTxs) =>
          response.status(HTTPStatus.OK)
            .json({
                response: pagedTxs
            })
        )
        .catch((error) =>
          response.status(HTTPStatus.INTERNAL_SERVER_ERROR)
            .json({ error: error.message })
        );
    });
};

import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate'
import { getTransactionHistory } from '../services/transaction'

const getPagedTransactions = (userID, page) => {
  const allUserTransactions = getTransactionHistory(userID);
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

      const responseData = {
        response: getPagedTransactions(request.userID, page),
      };

      response.status(HTTPStatus.OK)
        .json(responseData);
    });
};
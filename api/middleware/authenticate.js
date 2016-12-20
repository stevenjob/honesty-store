const jwt = require('jsonwebtoken');
const HTTPStatus = require('http-status');
const { secretKey } = require('../constants');
const { getAccountID } = require('../services/accounts');

const authenticate = (request, response, next) => {
  // This comes in the form: 'Bearer <token>'
  const token = request.headers.authorization.split(' ')[1];

  if (token == null || token === '') {
    response.status(HTTPStatus.UNAUTHORIZED)
      .json({
        error: {
          message: 'No access token provided',
        },
      });
    return;
  }

  jwt.verify(token, secretKey, (err) => {
    if (err) {
      response.status(HTTPStatus.UNAUTHORIZED)
        .json({
          error: {
            message: 'Invalid access token provided',
          },
        });
      return;
    }

    // Check valid account
    const accountID = getAccountID(token);
    if (accountID == null) {
      response.status(HTTPStatus.UNAUTHORIZED)
        .json({
          error: {
            message: 'Invalid access token provided',
          },
        });
      return;
    }

    // eslint-disable-next-line no-param-reassign
    request.accountID = accountID;
    next();
  });
};

module.exports = authenticate;

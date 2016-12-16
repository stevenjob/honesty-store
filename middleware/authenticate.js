const jwt = require('jsonwebtoken');
const { secretKey } = require('../constants');
const { getAccountID } = require('../services/accounts');

const authenticate = (request, response, next) => {
  // This comes in the form: 'Bearer <token>'
  const token = request.headers.authorization.split(' ')[1];

  if (token == null || token === '') {
    return response.status(401)
      .json({
        error: {
          message: 'No access token provided',
        },
      });
  }

  jwt.verify(token, secretKey, (err) => {
    if (err) {
      return response.status(403)
        .json({
          error: {
            message: 'Invalid access token provided',
          },
        });
    }

    // Check valid account
    const accountID = getAccountID(token);
    if (accountID == null) {
      return response.status(403)
        .json({
          error: {
            message: 'Invalid access token provided',
          },
        });
    }

    // eslint-disable-next-line no-param-reassign
    request.accountID = accountID;
    next();
  });
};

module.exports = { authenticate };

const jwt = require('jsonwebtoken');
const HTTPStatus = require('http-status');
const { secretKey } = require('../constants');
const { getAccountIDFromAccessToken, getAccountIDFromRefreshToken } = require('../services/accounts');

const getToken = request => request.headers.authorization.split(' ')[1];

const tokenIsValid = (token) => {
  let isValid = true;
  jwt.verify(token, secretKey, (err) => {
    if (err) {
      isValid = false;
    }
  });
  return isValid;
};

const authenticateToken = (request, response, next, tokenRetrievalGetter) => {
  const sendInvalidTokenResponse = () => {
    response.status(HTTPStatus.UNAUTHORIZED)
      .json({
        error: {
          message: 'Invalid token provided',
        },
      });
  };

  const token = getToken(request);

  if (!tokenIsValid(token)) {
    sendInvalidTokenResponse();
    return;
  }

  // Check valid account
  let accountID;

  try {
    accountID = tokenRetrievalGetter(token);
  } catch (e) {
    sendInvalidTokenResponse();
    return;
  }

  // eslint-disable-next-line no-param-reassign
  request.accountID = accountID;
  next();
};

const authenticateAccessToken = (request, response, next) =>
  authenticateToken(request, response, next, getAccountIDFromAccessToken);

const authenticateRefreshToken = (request, response, next) =>
  authenticateToken(request, response, next, getAccountIDFromRefreshToken);

module.exports = { authenticateAccessToken, authenticateRefreshToken };

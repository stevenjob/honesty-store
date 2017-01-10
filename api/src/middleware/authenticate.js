const jwt = require('jsonwebtoken');
const HTTPStatus = require('http-status');
const { secretKey } = require('../constants');
const { getAccountIDFromAccessToken, getAccountIDFromRefreshToken, getAccountIDFromEmailToken } = require('../services/user');

const getToken = request => request.headers.authorization.split(' ')[1];

const authenticateToken = (request, response, next, tokenRetrievalGetter) => {
  try {
    const token = getToken(request);
    jwt.verify(token, secretKey);
    // eslint-disable-next-line no-param-reassign
    request.userID = tokenRetrievalGetter(token);
    next();
  } catch (e) {
    response.status(HTTPStatus.UNAUTHORIZED)
      .json({
        error: {
          message: 'Invalid token provided',
          detail: e.message,
        },
      });
  }
};

const authenticateAccessToken = (request, response, next) =>
  authenticateToken(request, response, next, getAccountIDFromAccessToken);

const authenticateRefreshToken = (request, response, next) =>
  authenticateToken(request, response, next, getAccountIDFromRefreshToken);

const authenticateEmailToken = (request, response, next) =>
  authenticateToken(request, response, next, getAccountIDFromEmailToken);

module.exports = { authenticateAccessToken, authenticateRefreshToken, authenticateEmailToken };

import jwt = require('jsonwebtoken');
import HTTPStatus = require('http-status');
import { secretKey } from '../constants'
import { getUserIDFromAccessToken, getUserIDFromRefreshToken, getUserIDFromEmailToken } from '../services/user'
import * as winston from 'winston';

const getToken = request => request.headers.authorization.split(' ')[1];

const handleInvalidToken = (response, error) => {
  winston.error(`couldn't authenticate token`, e);
  response.status(HTTPStatus.UNAUTHORIZED)
    .json({
      error: {
        message: 'Invalid token provided',
        detail: error.message,
      },
    });
};

const authenticateToken = (request, response, next, tokenRetrievalGetter) => {
  const token = getToken(request);

  // token verification is handled by the user service / tokenRetrievalGetter
  tokenRetrievalGetter(token)
    .then((userID) => {
      // eslint-disable-next-line no-param-reassign
      request.userID = userID;
      next(); // we assume next doesn't throw, and don't return its result here
    })
    .catch((error) =>
      handleInvalidToken(response, error));
};

export const authenticateAccessToken = (request, response, next) =>
  authenticateToken(request, response, next, getUserIDFromAccessToken);

export const authenticateRefreshToken = (request, response, next) =>
  authenticateToken(request, response, next, getUserIDFromRefreshToken);

export const authenticateEmailToken = (request, response, next) =>
  authenticateToken(request, response, next, getUserIDFromEmailToken);

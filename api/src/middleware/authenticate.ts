import jwt = require('jsonwebtoken');
import HTTPStatus = require('http-status');
import { secretKey } from '../constants'
import { getUserIDFromAccessToken, getUserIDFromRefreshToken, getUserIDFromEmailToken } from '../services/user'
import * as winston from 'winston';

const getToken = request => request.headers.authorization.split(' ')[1];

const authenticateToken = (request, response, next, tokenRetrievalGetter) => {
  try {
    const token = getToken(request);
    jwt.verify(token, secretKey);
    // eslint-disable-next-line no-param-reassign
    request.userID = tokenRetrievalGetter(token);
    next();
  } catch (e) {
    winston.error(`couldn't authenticate token`, e);
    response.status(HTTPStatus.UNAUTHORIZED)
      .json({
        error: {
          message: 'Invalid token provided',
          detail: e.message,
        },
      });
  }
};

export const authenticateAccessToken = (request, response, next) =>
  authenticateToken(request, response, next, getUserIDFromAccessToken);

export const authenticateRefreshToken = (request, response, next) =>
  authenticateToken(request, response, next, getUserIDFromRefreshToken);

export const authenticateEmailToken = (request, response, next) =>
  authenticateToken(request, response, next, getUserIDFromEmailToken);

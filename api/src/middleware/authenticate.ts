import jwt = require('jsonwebtoken');
import HTTPStatus = require('http-status');
import { secretKey } from '../constants'
import {
  getUserByAccessToken,
  getUserByRefreshToken,
  getUserByMagicLinkToken } from '../../../user/src/client/index';
import { createAuthenticationKey } from '../../../service/src/key'
import * as winston from 'winston';

const getToken = request => request.headers.authorization.split(' ')[1];

const handleInvalidToken = (response, error) => {
  winston.error(`couldn't authenticate token`, error);
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
  const authKey = createAuthenticationKey();
  tokenRetrievalGetter(authKey, token)
    .then((user) => {
      request.key = authKey.setUserId(user.id);
      request.user = user;

      next(); // we assume next doesn't throw, and don't return its result here
    })
    .catch((error) =>
      handleInvalidToken(response, error));
};

export const authenticateAccessToken = (request, response, next) =>
  authenticateToken(request, response, next, getUserByAccessToken);

export const authenticateRefreshToken = (request, response, next) =>
  authenticateToken(request, response, next, getUserByRefreshToken);

export const authenticateEmailToken = (request, response, next) =>
  authenticateToken(request, response, next, getUserByMagicLinkToken);

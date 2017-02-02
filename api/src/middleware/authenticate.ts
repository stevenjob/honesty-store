import HTTPStatus = require('http-status');
import { createAuthenticationKey, createUnauthenticatedKey } from '../../../service/src/key';
import { error } from '../../../service/src/log';
import {
  getUserByAccessToken,
  getUserByMagicLinkToken,
  getUserByRefreshToken } from '../../../user/src/client/index';

const getToken = request => request.headers.authorization.split(' ')[1];

const handleInvalidToken = (response, e) => {
  error(createUnauthenticatedKey(), 'couldn\'t authenticate token', e);
  response.status(HTTPStatus.UNAUTHORIZED)
    .json({
      error: {
        message: 'Invalid token provided',
        detail: e.message
      }
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

export const noopAuthentication = (request, response, next) =>
  next();

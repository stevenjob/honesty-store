import HTTPStatus = require('http-status');
import { createAuthenticationKey } from '@honesty-store/service/lib/key';
import { error } from '@honesty-store/service/lib/log';
import {
  getUserByAccessToken,
  getUserByMagicLinkToken,
  getUserByRefreshToken
} from '@honesty-store/user/lib/client/index';

const getToken = (request) => {
  const { authorization } = request.headers;
  if (authorization == null) {
    throw new Error('No Authorization header provided');
  }
  const authMatch = authorization.match(/Bearer:\s*([^\s].*)/);
  if (authMatch.length !== 2) {
    throw new Error('No token provided');
  }
  return authMatch[1];
};

const handleInvalidToken = (key, response, e) => {
  error(key, `couldn't authenticate token`, e);

  response.status(HTTPStatus.UNAUTHORIZED)
    .json({
      error: {
        message: 'Invalid token provided',
        detail: e.message,
        code: e.code || 'UnknownError'
      }
    });
};

const authenticateTokenAsync = async (authKey, request, tokenRetrievalGetter) => {
  const token = getToken(request);

  // token verification is handled by the user service / tokenRetrievalGetter
  const user = await tokenRetrievalGetter(authKey, token);

  request.key = authKey.setUserId(user.id);
  request.user = user;
};

const authenticateToken = (request, response, next, tokenRetrievalGetter) => {
  const authKey = request.key || createAuthenticationKey();

  authenticateTokenAsync(authKey, request, tokenRetrievalGetter)
    .then(next)
    .catch((error) => {
      handleInvalidToken(authKey, response, error);
    });
};

export const authenticateAccessToken = (request, response, next) =>
  authenticateToken(request, response, next, getUserByAccessToken);

export const authenticateRefreshToken = (request, response, next) =>
  authenticateToken(request, response, next, getUserByRefreshToken);

export const authenticateEmailToken = (request, response, next) =>
  authenticateToken(request, response, next, getUserByMagicLinkToken);

export const noopAuthentication = (_request, _response, next) =>
  next();

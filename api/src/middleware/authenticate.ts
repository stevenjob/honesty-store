import HTTPStatus = require('http-status');
import { createAuthenticationKey } from '@honesty-store/service/lib/key';
import { error } from '@honesty-store/service/lib/log';
import {
  getUserByAccessToken,
  getUserByMagicLinkToken,
  getUserByRefreshToken
} from '@honesty-store/user';

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

const authenticateAdminUser = (request, _response, next) => {
  const { id } = request.user;
  const allowedUserIds = [
    'f9c8b541-0a30-4adc-8e0d-887e6db9f301',
    '67b8dcc6-2f81-4fef-aa87-ecd9d22a11b1',
    'a8960624-7558-468c-9791-984ca0c620ba',
    'c71733c4-dc05-42f9-848e-fb53bf08a2d7'
  ];
  if (!allowedUserIds.some((el) => el === id)) {
    throw new Error(`userId ${id} does not have permission to view item details`);
  }
  next();
};

export const authenticateAccessTokenAndAdminUser = (request, response, next) => {
  authenticateAccessToken(
    request,
    response,
    () => authenticateAdminUser(request, response, next)
  );
};

export const authenticateAccessToken = (request, response, next) =>
  authenticateToken(request, response, next, getUserByAccessToken);

export const authenticateRefreshToken = (request, response, next) =>
  authenticateToken(request, response, next, getUserByRefreshToken);

export const authenticateEmailToken = (request, response, next) =>
  authenticateToken(request, response, next, getUserByMagicLinkToken);

export const noopAuthentication = (_request, _response, next) =>
  next();

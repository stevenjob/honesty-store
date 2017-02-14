import jwt = require('jsonwebtoken');
import ms = require('ms');

const secret = process.env.USER_TOKEN_SECRET;
if (!secret) {
  throw new Error('no $USER_TOKEN_SECRET provided');
}

const signToken = (payload, expiresIn) => jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn });

export const signAccessToken = ({ userId }) => signToken({ userId }, '5m');

export const signRefreshToken = ({ userId, refreshToken }) => signToken({ userId, refreshToken }, '1y');

const verifyToken = (token) => {
  try {
    return jwt.verify(token, secret, { algorithms: ['HS256'], clockTolerance: ms('30s') });
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      throw new CodedError('TokenExpired', 'token expired');
    }
    throw e;
  }
};

export const verifyAccessToken = (token) => {
  const { userId, refreshToken } = verifyToken(token);
  if (refreshToken != null) {
    throw new Error('Refresh token used in place of access token');
  }
  return { userId };
};

export const verifyRefreshToken = (token) => {
  const { userId, refreshToken } = verifyToken(token);
  if (refreshToken == null) {
    throw new Error('Access token used in place of refresh token');
  }
  return { userId, refreshToken };
};

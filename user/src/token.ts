import jwt = require('jsonwebtoken');
import ms = require('ms');

const secret = process.env.JWT_SECRET;

const signToken = (payload, expiresIn) => jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn });

export const signAccessToken = ({ userId }) => signToken({ userId }, ms('5m'));

export const signRefreshToken = ({ userId, refreshToken }) => signToken({ userId, refreshToken }, ms('1y'));

export const verifyToken = (token) => jwt.verify(token, secret, { algorithms: ['HS256'], clockTolerance: ms('30s') });
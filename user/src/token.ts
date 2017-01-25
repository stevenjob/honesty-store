import jwt = require('jsonwebtoken');
import ms = require('ms');

const secret = process.env.JWT_SECRET;

const signToken = (payload, expiresIn) => jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn });

export const signAccessToken = ({ userId }) => signToken({ userId }, '5m');

export const signRefreshToken = ({ userId, refreshToken }) => signToken({ userId, refreshToken }, '1y');

const verifyToken = (token) => jwt.verify(token, secret, { algorithms: ['HS256'], clockTolerance: ms('30s') });

export const verifyAccessToken = (token) => {
    const { userId, refreshToken } = verifyToken(token);
    if (refreshToken != null) {
        throw new Error(`Refresh token used in place of access token`);
    }
    return { userId };
};

export const verifyRefreshToken = (token) => {
    const { userId, refreshToken } = verifyToken(token);
    if (refreshToken == null) {
        throw new Error(`Access token used in place of refresh token`);
    }
    return { userId, refreshToken };
};

import jwt = require('jsonwebtoken');
import ms = require('ms');

const secret = process.env.SERVICE_TOKEN_SECRET;

export const signServiceSecret = ({ baseUrl }) => jwt.sign({ baseUrl }, secret, { algorithm: 'HS256', expiresIn: '30s' })

export const verifyServiceSecret = (opaque, expectedBaseUrl) => {
    const { baseUrl } = jwt.verify(opaque, secret, { algorithms: ['HS256'], clockTolerance: ms('30s') })

    if (baseUrl !== expectedBaseUrl) {
        throw new Error(`Incorrect service secret`);
    }
};

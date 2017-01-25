import jwt = require('jsonwebtoken');
import ms = require('ms');
import { baseUrl } from './baseUrl';

const secret = process.env.SERVICE_TOKEN_SECRET;

export const signServiceSecret = () => jwt.sign({ baseUrl }, secret, { algorithm: 'HS256', expiresIn: '30s' })

export const verifyServiceSecret = (opaqueObject) => {
    const { foundBaseUrl } = jwt.verify(opaqueObject, secret, { algorithms: ['HS256'], clockTolerance: ms('30s') })

    if (foundBaseUrl !== baseUrl) {
        throw new Error(`Incorrect service secret`);
    }
};

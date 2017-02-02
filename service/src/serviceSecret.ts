import jsonwebtoken = require('jsonwebtoken');
import ms = require('ms');
import { baseUrl } from './baseUrl';

const secret = process.env.SERVICE_TOKEN_SECRET;
if (!secret) {
  throw new Error('no $SERVICE_TOKEN_SECRET provided');
}
export const signServiceSecret = () => jsonwebtoken.sign({ baseUrl }, secret, { algorithm: 'HS256', expiresIn: '30s' });

export const verifyServiceSecret = (opaqueObject) => {
  const { baseUrl: foundBaseUrl } = jsonwebtoken.verify(opaqueObject, secret, { algorithms: ['HS256'], clockTolerance: ms('30s') });

  if (foundBaseUrl !== baseUrl) {
    const e: any = new Error('Incorrect service secret');
    e.invalidServiceSecret = foundBaseUrl;
    throw e;
  }
};

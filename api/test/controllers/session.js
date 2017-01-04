const request = require('request');
const assert = require('chai').assert;
const HTTPStatus = require('http-status');
const { registerAccount, __accounts } = require('../../src/services/accounts');

require('../../src/app');

const baseURL = 'http://localhost:3000/api/v1';

describe('/session', () => {
  beforeEach(() => {
    __accounts.length = 0;
  });

  describe('Refresh Token Validation', () => {
    it('should return response with \'UNAUTHORIZED\' status code when invalid refresh token provided',
      (done) => {
        request.post(`${baseURL}/session`)
          .auth(null, null, true, '123')
          .on('response', (response) => {
            assert.equal(response.statusCode, HTTPStatus.UNAUTHORIZED);
            done();
          });
      });
    it('should return response with \'OK\' status code when valid refresh token provided',
      (done) => {
        const { refreshToken } = registerAccount('NCL');
        request.post(`${baseURL}/session`)
          .auth(null, null, true, refreshToken)
          .on('response', (response) => {
            assert.equal(response.statusCode, HTTPStatus.OK);
            done();
          });
      });
  });

  describe('Response Data', () => {
    it('should return a new access token',
      (done) => {
        const storeCode = 'NCL';
        // When registering, we set the user's current store to be 'storeCode'
        const account = registerAccount(storeCode);

        const previousAccessToken = account.accessToken;

        request.post({
          uri: `${baseURL}/session`,
          auth: {
            bearer: account.refreshToken,
          },
          json: true,
        },
        (error, response, body) => {
          assert.notEqual(body.response.accessToken, previousAccessToken);
          done();
        });
      });
  });
});

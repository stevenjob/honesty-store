const request = require('request');
const assert = require('chai').assert;
const HTTPStatus = require('http-status');

require('../app');

const baseURL = 'http://localhost:3000/api/v1';

describe('/register', () => {
  it('should contain a refresh token as part of its JSON response', (done) => {
    request.post(`${baseURL}/register`,
      (error, response, body) => {
        const parsed = JSON.parse(body);
        const refreshToken = parsed.response.refreshToken;
        assert.isNotNull(refreshToken);
        done();
      });
  });

  it('should contain an access token as part of its JSON response', (done) => {
    request.post(`${baseURL}/register`,
      (error, response, body) => {
        const parsed = JSON.parse(body);
        const accessToken = parsed.response.accessToken;
        assert.isNotNull(accessToken);
        done();
      });
  });
});

describe('/register2 token validation', () => {
  it('should return \'UNAUTHORIZED\' status code when no token provided', (done) => {
    request.post(`${baseURL}/register2`)
      .auth(null, null, true, '')
      .on('response', (response) => {
        assert.equal(response.statusCode, HTTPStatus.UNAUTHORIZED);
        done();
      });
  });
  it('should return \'UNAUTHORIZED\' status code when invalid token provided', (done) => {
    request.post(`${baseURL}/register2`)
      .auth(null, null, true, '123')
      .on('response', (response) => {
        assert.equal(response.statusCode, HTTPStatus.UNAUTHORIZED);
        done();
      });
  });
});

describe('Full registration phase', () => {
  it('should return a response with balance and transaction after calling /register2', (done) => {
    request.post(`${baseURL}/register`,
      (error1, response1, body1) => {
        const accessToken = JSON.parse(body1).response.accessToken;

        // Now we have this, call '/register2' to complete registration
        // TODO: look into promises to clean up this nesting
        request.post({
          uri: `${baseURL}/register2`,
          method: 'POST',
          auth: {
            bearer: accessToken,
          },
          json: true,
          body: {
            emailAddress: 'sburnstone@scottlogic.com',
            cardDetails: '1234123412341234',
            itemID: 1,
          },
        },
        (error2, response2, body2) => {
          assert.property(body2.response, 'balance');
          assert.property(body2.response, 'transactions');
          done();
        });
      });
  });
});

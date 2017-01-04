const request = require('request');
const assert = require('chai').assert;
const HTTPStatus = require('http-status');
const { registerAccount, __accounts, getAccountIDFromAccessToken } = require('../services/accounts');
const getSessionData = require('../services/session');

require('../app');

const baseURL = 'http://localhost:3000/api/v1';

describe('/register', () => {
  beforeEach(() => {
    __accounts.length = 0;
  });

  describe('Response Data', () => {
    const sendRequest = (storeCode, callback) => {
      const options = {
        uri: `${baseURL}/register`,
        json: true,
        body: { storeCode },
      };

      request.post(options, callback);
    };

    it('should contain a refresh token as part of its JSON response', (done) => {
      sendRequest('NCL',
        (error, response, body) => {
          const refreshToken = body.response.refreshToken;
          assert.isNotNull(refreshToken);
          done();
        });
    });

    it('should contain an access token as part of its JSON response', (done) => {
      sendRequest('NCL',
        (error, response, body) => {
          const accessToken = body.response.accessToken;
          assert.isNotNull(accessToken);
          done();
        });
    });

    it('should contain session data as part of its JSON response', (done) => {
      const storeCode = 'NCL';
      sendRequest(storeCode,
        (error, response, body) => {
          const userID = getAccountIDFromAccessToken(body.response.accessToken);
          const expectedSessionData = getSessionData(userID);
          assert.deepEqual(body.response.user, expectedSessionData.user);
          assert.deepEqual(body.response.store, expectedSessionData.store);
          done();
        });
    });
  });
});

describe('/register2', () => {
  const sendRequest = (attributes, callback) => {
    const { accessToken } = registerAccount('NCL');
    request.post({
      uri: `${baseURL}/register2`,
      auth: {
        bearer: accessToken,
      },
      json: true,
      body: attributes,
    },
    (error, response, body) => {
      callback(response, body, accessToken);
    });
  };

  describe('Response Data', () => {
    it('should contain session data as part of its JSON response', (done) => {
      sendRequest({ emailAddress: 'test@test.co.uk' },
        (response, body, accessToken) => {
          const userID = getAccountIDFromAccessToken(accessToken);
          const expectedSessionData = getSessionData(userID);
          assert.deepEqual(body.response.user, expectedSessionData.user);
          assert.deepEqual(body.response.store, expectedSessionData.store);
          done();
        });
    });
  });

  describe('Token validation', () => {
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

  describe('Email validation', () => {
    it('should return \'UNAUTHORIZED\' status code and relevant message when no email address provided', (done) => {
      sendRequest({ emailAddress: null }, (response, body) => {
        assert.equal(response.statusCode, HTTPStatus.UNAUTHORIZED);
        assert.equal(body.error.message, 'Invalid email address provided');
        done();
      });
    });

    it('should return \'UNAUTHORIZED\' status code and relevant message when invalid email address provided', (done) => {
      sendRequest({ emailAddress: '123.co.uk' }, (response, body) => {
        assert.equal(response.statusCode, HTTPStatus.UNAUTHORIZED);
        assert.equal(body.error.message, 'Invalid email address provided');
        done();
      });
    });

    it('should return \'OK\' status code and response data when valid email address provided', (done) => {
      sendRequest({ emailAddress: 'test@123.co.uk', itemID: 0 }, (response, body) => {
        assert.equal(response.statusCode, HTTPStatus.OK);
        assert.property(body, 'response');
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
});

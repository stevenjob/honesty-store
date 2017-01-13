const request = require('request');
const assert = require('chai').assert;
const HTTPStatus = require('http-status');
const { registerUser, __users, getUserIDFromAccessToken } = require('../../src/services/user');
const { getPrice } = require('../../src/services/store');
const getSessionData = require('../../src/services/session');

require('../../src/app');

const baseURL = 'http://localhost:3000/api/v1';

describe('/register', () => {
  beforeEach(() => {
    __users.length = 0;
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
      sendRequest('sl-ncl',
        (error, response, body) => {
          const refreshToken = body.response.refreshToken;
          assert.isNotNull(refreshToken);
          done();
        });
    });

    it('should contain an access token as part of its JSON response', (done) => {
      sendRequest('sl-ncl',
        (error, response, body) => {
          const accessToken = body.response.accessToken;
          assert.isNotNull(accessToken);
          done();
        });
    });

    it('should contain session data as part of its JSON response', (done) => {
      const storeCode = 'sl-ncl';
      sendRequest(storeCode,
        (error, response, body) => {
          const userID = getUserIDFromAccessToken(body.response.accessToken);
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
    const { accessToken } = registerUser('sl-ncl');
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
          const userID = getUserIDFromAccessToken(accessToken);
          const expectedSessionData = getSessionData(userID);
          assert.deepEqual(body.response.user, expectedSessionData.user);
          assert.deepEqual(body.response.store, expectedSessionData.store);
          done();
        });
    });

    it('should show correct balance after successful top up and initial purchase',
      (done) => {
        const topUpAmount = 500;
        const itemID = 0;
        sendRequest({
          emailAddress: 'test@test.co.uk',
          itemID,
          topUpAmount,
        },
        (response, body) => {
          const expectedBalance = topUpAmount - getPrice(itemID);
          assert.equal(body.response.user.balance, expectedBalance);
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
});

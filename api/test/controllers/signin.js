const request = require('request');
const assert = require('chai').assert;
const HTTPStatus = require('http-status');

const { registerAccount, __accounts, updateAccount, sendEmailToken } = require('../../src/services/accounts');
const getSessionData = require('../../src/services/session');

require('../../src/app');

const baseURL = 'http://localhost:3000/api/v1';

describe('/signin', () => {
  beforeEach(() => {
    __accounts.length = 0;
  });

  it('should return \'OK\' response status with already-registered email address', (done) => {
    const emailAddress = 'test1@test.com';
    const { id } = registerAccount('NCL');
    updateAccount(id, emailAddress, null);

    request.post({
      uri: `${baseURL}/signin`,
      json: true,
      body: { emailAddress },
    },
    (error, response) => {
      assert.equal(response.statusCode, HTTPStatus.OK);
      done();
    });
  });
});

describe('/signin2', () => {
  beforeEach(() => {
    __accounts.length = 0;
  });

  const sendSignIn2Request = (emailToken, callback) => {
    const options = {
      uri: `${baseURL}/signin2`,
      auth: {
        bearer: emailToken,
      },
      json: true,
    };
    request.post(options, callback);
  };

  describe('Email Token Validation', () => {
    it('should return \'OK\' response status with valid email token', (done) => {
      const emailAddress = 'test1@test.com';
      const account = registerAccount('NCL');
      updateAccount(account.id, emailAddress, null);
      // Simulate sending of email
      sendEmailToken(emailAddress);

      sendSignIn2Request(account.emailToken,
        (error, response) => {
          assert.equal(response.statusCode, HTTPStatus.OK);
          done();
        });
    });

    it('should return \'UNAUTHORIZED\' response status invalid email token', (done) => {
      sendSignIn2Request('',
        (error, response) => {
          assert.equal(response.statusCode, HTTPStatus.UNAUTHORIZED);
          done();
        });
    });

    describe('Response Data', () => {
      it('should contain a refresh token as part of response', (done) => {
        const emailAddress = 'test1@test.com';
        const account = registerAccount('NCL');
        updateAccount(account.id, emailAddress, null);
        sendEmailToken(emailAddress);

        sendSignIn2Request(account.emailToken,
          (error, response, body) => {
            assert.property(body.response, 'refreshToken');
            done();
          });
      });

      it('should contain session data as part of response', (done) => {
        const emailAddress = 'test1@test.com';
        const account = registerAccount('NCL');
        updateAccount(account.id, emailAddress, null);
        sendEmailToken(emailAddress);

        sendSignIn2Request(account.emailToken,
          (error, response, body) => {
            const expectedSessionData = getSessionData(account.id);
            assert.deepEqual(body.response.user, expectedSessionData.user);
            assert.deepEqual(body.response.store, expectedSessionData.store);
            done();
          });
      });
    });
  });
});

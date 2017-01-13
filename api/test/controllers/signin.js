const request = require('request');
const assert = require('chai').assert;
const HTTPStatus = require('http-status');

const { registerUser, __users, updateUser, sendEmailToken } = require('../../src/services/user');
const getSessionData = require('../../src/services/session');

require('../../src/app');

const baseURL = 'http://localhost:3001/api/v1';

describe('/signin', () => {
  beforeEach(() => {
    __users.length = 0;
  });

  it('should return \'OK\' response status with already-registered email address', (done) => {
    const emailAddress = 'test1@test.com';
    const { id } = registerUser('NCL');
    updateUser(id, emailAddress, null);

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
    __users.length = 0;
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
      const user = registerUser('NCL');
      updateUser(user.id, emailAddress, null);
      // Simulate sending of email
      sendEmailToken(emailAddress);

      sendSignIn2Request(user.emailToken,
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
        const user = registerUser('NCL');
        updateUser(user.id, emailAddress, null);
        sendEmailToken(emailAddress);

        sendSignIn2Request(user.emailToken,
          (error, response, body) => {
            assert.property(body.response, 'refreshToken');
            done();
          });
      });

      it('should contain session data as part of response', (done) => {
        const emailAddress = 'test1@test.com';
        const user = registerUser('NCL');
        updateUser(user.id, emailAddress, null);
        sendEmailToken(emailAddress);

        sendSignIn2Request(user.emailToken,
          (error, response, body) => {
            const expectedSessionData = getSessionData(user.id);
            assert.deepEqual(body.response.user, expectedSessionData.user);
            assert.deepEqual(body.response.store, expectedSessionData.store);
            done();
          });
      });
    });
  });
});

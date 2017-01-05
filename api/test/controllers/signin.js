const request = require('request');
const assert = require('chai').assert;
const HTTPStatus = require('http-status');

const { registerAccount, __accounts, updateAccount, sendEmailToken } = require('../../src/services/accounts');

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

  describe('Email Token Validation', () => {
    it('should return \'OK\' response status with valid email token', (done) => {
      const emailAddress = 'test1@test.com';
      const account = registerAccount('NCL');
      updateAccount(account.id, emailAddress, null);
      // Simulate sending of email
      sendEmailToken(emailAddress);

      request.post({
        uri: `${baseURL}/signin2`,
        json: true,
        body: { emailToken: account.emailToken },
      },
      (error, response) => {
        assert.equal(response.statusCode, HTTPStatus.OK);
        done();
      });
    });

    it('should return \'UNAUTHORIZED\' response status invalid email token', (done) => {
      request.post({
        uri: `${baseURL}/signin2`,
        json: true,
        body: { emailToken: '' },
      },
      (error, response) => {
        assert.equal(response.statusCode, HTTPStatus.UNAUTHORIZED);
        done();
      });
    });
  });
});

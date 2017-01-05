const request = require('request');
const assert = require('chai').assert;
const HTTPStatus = require('http-status');

const { registerAccount, __accounts, updateAccount } = require('../../src/services/accounts');

require('../../src/app');

const baseURL = 'http://localhost:3000/api/v1';

describe('/signin', () => {
  beforeEach(() => {
    __accounts.length = 0;
  });

  it('should return \'OK\' response status with already-registered email address', () => {
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
    });
  });
});

const request = require('request');
const assert = require('chai').assert;
const HTTPStatus = require('http-status');

const { registerAccount, __accounts } = require('../../src/services/accounts');

require('../../src/app');

const baseURL = 'http://localhost:3000/api/v1';

describe('/topup', () => {
  beforeEach(() => {
    __accounts.length = 0;
  });

  it('should credit account with requested amount and return new balance',
    (done) => {
      const { accessToken } = registerAccount('NCL');

      const topUpAmount = 500;

      request.post({
        uri: `${baseURL}/topup`,
        json: true,
        body: {
          cardDetails: '1234123412341234',
          amount: topUpAmount,
        },
        auth: {
          bearer: accessToken,
        },
      },
      (error, response, body) => {
        assert.equal(body.response.balance, topUpAmount);
        done();
      });
    });
});

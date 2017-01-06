const request = require('request');
const assert = require('chai').assert;
const HTTPStatus = require('http-status');

const { registerAccount, __accounts } = require('../../src/services/accounts');
const { getTransactionHistory } = require('../../src/services/transactions');

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

  it('should add new top up transaction to transaction service',
    (done) => {
      const { id, accessToken } = registerAccount('NCL');

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
      () => {
        const transactions = getTransactionHistory(id);
        const lastTransaction = transactions[0];
        assert.equal(lastTransaction.type, 'topup');
        assert.equal(lastTransaction.amount, topUpAmount);
        done();
      });
    });
});

const request = require('request');
const assert = require('chai').assert;

const { registerUser, __users } = require('../../src/services/user');
const { getTransactionHistory } = require('../../src/services/transaction');

require('../../src/app');

const baseURL = 'http://localhost:3000/api/v1';

describe('/topup', () => {
  beforeEach(() => {
    __users.length = 0;
  });

  it('should credit user with requested amount and return new balance',
    (done) => {
      const { accessToken } = registerUser('NCL');

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
      const { id, accessToken } = registerUser('NCL');

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

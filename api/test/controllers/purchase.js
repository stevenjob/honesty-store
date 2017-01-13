const request = require('request');
const assert = require('chai').assert;
const HTTPStatus = require('http-status');

const { registerUser, __users } = require('../../src/services/user');
const { getTransactionHistory, getBalance } = require('../../src/services/transaction');
const { getPrice } = require('../../src/services/store');

require('../../src/app');

const baseURL = 'http://localhost:3000/api/v1';

describe('/purchase', () => {
  beforeEach(() => {
    __users.length = 0;
  });

  it('should return \'OK\' response and error message when given invalid Item ID',
    (done) => {
      const { accessToken } = registerUser('SL-NCL');

      request.post({
        uri: `${baseURL}/purchase`,
        auth: {
          bearer: accessToken,
        },
        json: true,
        body: {
          itemID: 100,
        },
      },
      (error, response, body) => {
        assert.equal(response.statusCode, HTTPStatus.OK);
        assert.property(body, 'error');
        done();
      });
    });

  it('should return \'OK\' response and response data when given valid Item ID',
    (done) => {
      const itemID = 1;
      const { id, accessToken } = registerUser('SL-NCL');

      const balanceBeforePurchase = getBalance(id);

      request.post({
        uri: `${baseURL}/purchase`,
        auth: {
          bearer: accessToken,
        },
        json: true,
        body: {
          itemID,
        },
      },
      (error, response, body) => {
        assert.equal(response.statusCode, HTTPStatus.OK);

        const itemPrice = getPrice(itemID);
        const expectedBalance = balanceBeforePurchase - itemPrice;
        assert.equal(body.response.balance, expectedBalance);

        const transactions = getTransactionHistory(id);
        const lastTransaction = transactions[0];

        assert.deepEqual(body.response.transaction, lastTransaction);
        done();
      });
    });
});

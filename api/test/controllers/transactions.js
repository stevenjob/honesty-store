const request = require('request');
const assert = require('chai').assert;
const { registerAccount } = require('../../src/services/accounts');
const { addItemTransaction, getTransactionHistory } = require('../../src/services/transactions');

const baseURL = 'http://localhost:3000/api/v1';

describe('/transactions', () => {
  const generateDummyTransactions = (userID) => {
    const numberOfTransactions = 15;
    for (let i = 0; i < numberOfTransactions; i += 1) {
      addItemTransaction(userID, 1);
    }
  };

  const sendRequest = (page, callback) => {
    const { id, accessToken } = registerAccount('NCL');
    generateDummyTransactions(id);
    request.get({
      uri: `${baseURL}/transactions?page=${page}`,
      auth: {
        bearer: accessToken,
      },
    },
    (error, response, body) => callback(error, response, body, id));
  };

  it('should retrieve first page\'s transaction data',
    (done) => {
      sendRequest(0,
        (error, response, body, userID) => {
          const result = JSON.parse(body);
          const transactions = result.response.items;

          const expectedTransactions = getTransactionHistory(userID).slice(0, 10);

          assert.deepEqual(transactions, expectedTransactions);
          done();
        });
    });

  it('should retrieve last page\'s transaction data',
    (done) => {
      sendRequest(1,
        (error, response, body, userID) => {
          const result = JSON.parse(body);
          const transactions = result.response.items;

          const expectedTransactions = getTransactionHistory(userID).slice(10, 15);

          assert.deepEqual(transactions, expectedTransactions);
          done();
        });
    });

  it('should return last page number that can be retrieved',
    (done) => {
      sendRequest(0,
      (error, response, body) => {
        const result = JSON.parse(body);

        const expectedLastPage = 1;

        assert.equal(result.response.lastPage, expectedLastPage);
        done();
      });
    });
});

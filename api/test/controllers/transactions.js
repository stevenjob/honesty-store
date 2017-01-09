const request = require('request');
const assert = require('chai').assert;
const { registerAccount } = require('../../src/services/accounts');
const { addItemTransaction } = require('../../src/services/transactions');

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
    callback);
  };

  it('should retrieve first page\'s transaction data',
    (done) => {
      sendRequest(0,
        (error, response, body) => {
          const result = JSON.parse(body);
          const transactions = result.response.items;

          const expectedNumberTransactions = 10;

          assert.equal(transactions.length, expectedNumberTransactions);
          done();
        });
    });

  it('should retrieve last page\'s transaction data',
    (done) => {
      sendRequest(1,
      (error, response, body) => {
        const result = JSON.parse(body);
        const transactions = result.response.items;

        const expectedNumberTransactions = 5;

        assert.equal(transactions.length, expectedNumberTransactions);
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

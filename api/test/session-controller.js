const request = require('request');
const assert = require('chai').assert;
const HTTPStatus = require('http-status');
const { registerAccount, updateAccount, __accounts } = require('../services/accounts');
const { addItemTransaction } = require('../services/transactions');
const { getItems } = require('../services/store');

require('../app');

const baseURL = 'http://localhost:3000/api/v1';

describe('/session', () => {
  beforeEach(() => {
    __accounts.length = 0;
  });

  describe('Refresh Token Validation', () => {
    it('should return response with \'UNAUTHORIZED\' status code when invalid refresh token provided',
      (done) => {
        request.post(`${baseURL}/session`)
          .auth(null, null, true, '123')
          .on('response', (response) => {
            assert.equal(response.statusCode, HTTPStatus.UNAUTHORIZED);
            done();
          });
      });
    it('should return response with \'OK\' status code when valid refresh token provided',
      (done) => {
        const { refreshToken } = registerAccount('NCL');
        request.post(`${baseURL}/session`)
          .auth(null, null, true, refreshToken)
          .on('response', (response) => {
            assert.equal(response.statusCode, HTTPStatus.OK);
            done();
          });
      });
  });

  describe('Response Data', () => {
    it('should return masked user card number',
      (done) => {
        const account = registerAccount('NCL');
        const cardDetails = '1234123412341234';
        updateAccount(account.id, '', cardDetails);

        request.post({
          uri: `${baseURL}/session`,
          auth: {
            bearer: account.refreshToken,
          },
          json: true,
        },
        (error, response, body) => {
          const expectedCardNumber = 'XXXXXXXXXXXX1234';
          assert.equal(body.response.user.cardNumber, expectedCardNumber);
          done();
        });
      });

    it('should return user transcation details',
      (done) => {
        const account = registerAccount('NCL');
        const itemPrices = [20, 50];

        addItemTransaction(account.id, itemPrices[0]);
        addItemTransaction(account.id, itemPrices[1]);

        request.post({
          uri: `${baseURL}/session`,
          auth: {
            bearer: account.refreshToken,
          },
          json: true,
        },
        (error, response, body) => {
          const transactions = body.response.user.transactions;
          assert.equal(transactions.length, itemPrices.length);
          assert.equal(transactions[0].amount, -itemPrices[0]);
          assert.equal(transactions[1].amount, -itemPrices[1]);
          done();
        });
      });

    it('should return user\'s balance',
      (done) => {
        const account = registerAccount('NCL');
        const itemPrice = 100;

        addItemTransaction(account.id, itemPrice);

        request.post({
          uri: `${baseURL}/session`,
          auth: {
            bearer: account.refreshToken,
          },
          json: true,
        },
        (error, response, body) => {
          const balance = body.response.user.balance;
          assert.equal(balance, -itemPrice);
          done();
        });
      });

    it('should return store items',
      (done) => {
        const storeCode = 'NCL';
        const account = registerAccount(storeCode);

        request.post({
          uri: `${baseURL}/session`,
          auth: {
            bearer: account.refreshToken,
          },
          json: true,
        },
        (error, response, body) => {
          const expectedItems = getItems(storeCode);
          assert.deepEqual(body.response.store.items, expectedItems);
          done();
        });
      });

    it('should return user\'s default Store Code',
      (done) => {
        const storeCode = 'NCL';
        // When registering, we set the user's current store to be 'storeCode'
        const account = registerAccount(storeCode);

        request.post({
          uri: `${baseURL}/session`,
          auth: {
            bearer: account.refreshToken,
          },
          json: true,
        },
        (error, response, body) => {
          assert.equal(body.response.store.code, storeCode);
          done();
        });
      });

    it('should return a new access token',
      (done) => {
        const storeCode = 'NCL';
        // When registering, we set the user's current store to be 'storeCode'
        const account = registerAccount(storeCode);

        const previousAccessToken = account.accessToken;

        request.post({
          uri: `${baseURL}/session`,
          auth: {
            bearer: account.refreshToken,
          },
          json: true,
        },
        (error, response, body) => {
          assert.notEqual(body.response.accessToken, previousAccessToken);
          done();
        });
      });
  });
});

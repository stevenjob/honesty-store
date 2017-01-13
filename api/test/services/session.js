const assert = require('chai').assert;
const { registerUser, updateUser, __users } = require('../../src/services/user');
const { addItemTransaction } = require('../../src/services/transaction');
const { getItems } = require('../../src/services/store');
const getSessionData = require('../../src/services/session');

describe('Session Service', () => {
  beforeEach(() => {
    __users.length = 0;
  });

  it('should return masked user card number',
    () => {
      const user = registerUser('SL-NCL');
      const cardDetails = '1234123412341234';
      updateUser(user.id, '', cardDetails);

      const sessionData = getSessionData(user.id);

      const expectedCardNumber = 'XXXXXXXXXXXX1234';
      assert.equal(sessionData.user.cardNumber, expectedCardNumber);
    });

  it('should return user transaction details',
    () => {
      const user = registerUser('SL-NCL');
      const itemPrices = [20, 50];

      addItemTransaction(user.id, itemPrices[0]);
      addItemTransaction(user.id, itemPrices[1]);

      const sessionData = getSessionData(user.id);

      const transactions = sessionData.user.transactions;
      assert.equal(transactions.length, itemPrices.length);
      assert.equal(transactions[0].amount, -itemPrices[0]);
      assert.equal(transactions[1].amount, -itemPrices[1]);
    });

  it('should return user\'s balance',
    () => {
      const user = registerUser('SL-NCL');
      const itemPrice = 100;

      addItemTransaction(user.id, itemPrice);

      const sessionData = getSessionData(user.id);

      const balance = sessionData.user.balance;
      assert.equal(balance, -itemPrice);
    });

  it('should return store items',
    () => {
      const storeCode = 'SL-NCL';
      const user = registerUser(storeCode);

      const sessionData = getSessionData(user.id);

      const expectedItems = getItems(storeCode);
      assert.deepEqual(sessionData.store.items, expectedItems);
    });

  it('should return user\'s default Store Code',
    () => {
      const storeCode = 'SL-NCL';
      // When registering, we set the user's current store to be 'storeCode'
      const user = registerUser(storeCode);

      const sessionData = getSessionData(user.id);

      assert.equal(sessionData.store.code, storeCode);
    });
});

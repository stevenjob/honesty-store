const assert = require('chai').assert;
const { registerAccount, updateAccount, __accounts } = require('../../src/services/accounts');
const { addItemTransaction } = require('../../src/services/transactions');
const { getItems } = require('../../src/services/store');
const getSessionData = require('../../src/services/session');

describe('Session Service', () => {
  beforeEach(() => {
    __accounts.length = 0;
  });

  it('should return masked user card number',
    () => {
      const account = registerAccount('NCL');
      const cardDetails = '1234123412341234';
      updateAccount(account.id, '', cardDetails);

      const sessionData = getSessionData(account.id);

      const expectedCardNumber = 'XXXXXXXXXXXX1234';
      assert.equal(sessionData.user.cardNumber, expectedCardNumber);
    });

  it('should return user transaction details',
    () => {
      const account = registerAccount('NCL');
      const itemPrices = [20, 50];

      addItemTransaction(account.id, itemPrices[0]);
      addItemTransaction(account.id, itemPrices[1]);

      const sessionData = getSessionData(account.id);

      const transactions = sessionData.user.transactions;
      assert.equal(transactions.length, itemPrices.length);
      assert.equal(transactions[0].amount, -itemPrices[0]);
      assert.equal(transactions[1].amount, -itemPrices[1]);
    });

  it('should return user\'s balance',
    () => {
      const account = registerAccount('NCL');
      const itemPrice = 100;

      addItemTransaction(account.id, itemPrice);

      const sessionData = getSessionData(account.id);

      const balance = sessionData.user.balance;
      assert.equal(balance, -itemPrice);
    });

  it('should return store items',
    () => {
      const storeCode = 'NCL';
      const account = registerAccount(storeCode);

      const sessionData = getSessionData(account.id);

      const expectedItems = getItems(storeCode);
      assert.deepEqual(sessionData.store.items, expectedItems);
    });

  it('should return user\'s default Store Code',
    () => {
      const storeCode = 'NCL';
      // When registering, we set the user's current store to be 'storeCode'
      const account = registerAccount(storeCode);

      const sessionData = getSessionData(account.id);

      assert.equal(sessionData.store.code, storeCode);
    });
});

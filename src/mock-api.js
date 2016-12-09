class MockApi {
  constructor() {
    this.inventory = [
      { id: 0, name: "Snickers", price: 0.20 },
      { id: 1, name: "Extra Peppermint", price: 0.25 },
      { id: 2, name: "Twix", price: 0.20 }
    ];
    // Map email address to account balances
    this.userAccounts = new Map();

  }

  getProduct(id) {
    return this.inventory.find(element => element.id === id);
  }

  // Assume we want to log users in when this is called
  isEmailAddressRegistered(emailAddress) {
    return this.userAccounts.has(emailAddress);
  }

  createAccount(emailAddress) {
    // Create an account with an initial balance of 0
    this.userAccounts.set(emailAddress, 0);
  }

  getBalance() {
    return this.userAccounts.get(this._currentUserEmailAddress);
  }

  purchaseProduct(product) {
    const userBalance = this.getBalance(this._currentUserEmailAddress);
    this.userAccounts.set(this._currentUserEmailAddress, userBalance - product.price);
  }

  topUpAccount(topUpAmount, cardDetails) {
    return new Promise((resolve, reject) => {
      if (cardDetails.cardNumber === '1234123412341234'
        && cardDetails.expiryDate === '12/19'
        && cardDetails.cvcNumber === '000') {
        reject('Transaction rejected');
      } else {
        const userBalance = this.getBalance(this._currentUserEmailAddress);
        this.userAccounts.set(this._currentUserEmailAddress, userBalance + topUpAmount);
        resolve('Transaction approved');
      }
    });
  }
}

let mockApi = new MockApi();
export default mockApi;

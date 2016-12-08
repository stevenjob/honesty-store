class MockApi {
  constructor() {
    this.inventory = [
      { id: 0, name: "Snickers", price: 0.20 },
      { id: 1, name: "Extra Peppermint", price: 0.25 },
      { id: 2, name: "Twix", price: 0.20 }
    ];
  }

  getProduct(id) {
    return this.inventory.find(element => element.id === id);
  }

  isEmailAddressRegistered(emailAddress) {
    return false;
  }

  createAccount(emailAddress) {
    // do nothing for now
  }

  getBalance(emailAddress) {
    return 0;
  }

  topUpAccount(topUpAmount, cardDetails) {
    var promise = new Promise(function(resolve, reject) {
      if (cardDetails.cardNumber === '1234123412341234'
        && cardDetails.expiryDate === '12/19'
        && cardDetails.cvcNumber === '000') {
        reject('Transaction rejected');
      } else {
        resolve('Transaction approved');
      }
    });
    return promise;
  }
}

let mockApi = new MockApi();
export default mockApi;

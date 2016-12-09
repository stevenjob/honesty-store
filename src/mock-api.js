class MockApi {
  constructor() {
    this.inventory = [
      { id: 0, name: "Snickers", price: 0.20 },
      { id: 1, name: "Extra Peppermint", price: 0.25 },
      { id: 2, name: "Twix", price: 0.20 }
    ];
    this.balance = 0;
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

  getBalance() {
    return this.balance;
  }

  purchaseProduct(product) {
    this.balance -= product.price;
  }

  topUpAccount(topUpAmount, cardDetails) {
    return new Promise((resolve, reject) => {
      if (cardDetails.cardNumber === '1234123412341234'
        && cardDetails.expiryDate === '12/19'
        && cardDetails.cvcNumber === '000') {
        reject('Transaction rejected');
      } else {
        this.balance += topUpAmount;
        resolve('Transaction approved');
      }
    });
  }
}

let mockApi = new MockApi();
export default mockApi;

class ProductStore {
  constructor() {
    this.inventory = [
      { id: 0, name: "Snickers", price: 0.20 },
      { id: 1, name: "Extra Peppermint", price: 0.25 },
      { id: 2, name: "Twix", price: 0.20 }
    ];
  }

  productForID(id) {
    return this.inventory.find(element => element.id === id);
  }
}

let store = new ProductStore();
export default store;

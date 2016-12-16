const store = new Map();
store.set(0, { name: 'Twix', price: 20 });
store.set(1, { name: 'Mars', price: 30 });

const getPrice = id => store.get(id).price;

module.exports = { getPrice };

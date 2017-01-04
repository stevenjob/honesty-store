const items = new Map();
items.set(0, { name: 'Twix', price: 20 });
items.set(1, { name: 'Mars', price: 30 });

const stores = new Map();
stores.set('NCL', [0, 1]);
stores.set('EDIN', [1]);

const getPrice = (itemID) => {
  const item = items.get(itemID);
  if (item == null) {
    throw new Error(`Item does not exist with ID '${itemID}'`);
  }
  return item.price;
};

const getItems = (storeCode) => {
  const storeItemIDs = stores.get(storeCode);

  const storeItems = storeItemIDs.map((itemID) => {
    const item = items.get(itemID);
    return {
      id: itemID,
      name: item.name,
      price: item.price,
    };
  });

  return storeItems;
};

module.exports = { getPrice, getItems };

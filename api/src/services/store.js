const items = new Map();
items.set(0, { name: 'Walkers Cheese & Onion', price: 50 });
items.set(1, { name: 'Nature Valley Crunchy Oats & Honey', price: 40 });
items.set(2, { name: 'Snickers', price: 51 });
items.set(3, { name: 'Skittles', price: 48 });
items.set(4, { name: 'KitKat Chunky', price: 58 });

const allItems = [0, 1, 2, 3, 4];

const stores = new Map();
stores.set('sl-ncl', allItems);
stores.set('sl-edn', allItems);
stores.set('sl-brs', allItems);
stores.set('sl-ldn', allItems);

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

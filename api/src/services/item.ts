const items = new Map();
items.set(0, { name: 'Walkers Cheese & Onion', price: 50 });
items.set(1, { name: 'Nature Valley Crunchy Oats & Honey', price: 40 });
items.set(2, { name: 'Snickers', price: 51 });
items.set(3, { name: 'Skittles', price: 48 });
items.set(4, { name: 'KitKat Chunky', price: 58 });

export const getItem = (itemID) => {
  const item = items.get(itemID);
  if (item == null) {
    throw new Error(`Item does not exist with ID '${itemID}'`);
  }
  return item;
};

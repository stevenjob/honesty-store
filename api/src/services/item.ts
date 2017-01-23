const items = new Map();
items.set('46ced0c0-8815-4ed2-bfb6-40537f5bd512', { name: 'Walkers Cheese & Onion', price: 50 });
items.set('faeda516-bd9f-41ec-b949-7a676312b0ae', { name: 'Nature Valley Crunchy Oats & Honey', price: 40 });
items.set('b43c4a97-1112-41ce-8f91-5a8bda0dcdc8', { name: 'Snickers', price: 51 });
items.set('78816fba-150d-4282-b43d-900df45cea8b', { name: 'Skittles', price: 48 });
items.set('3fa0db7c-3f90-404e-b875-3792eda3e185', { name: 'KitKat Chunky', price: 58 });

export const getItem = (itemID) => {
  const item = items.get(itemID);
  if (item == null) {
    throw new Error(`Item does not exist with ID '${itemID}'`);
  }
  return item;
};

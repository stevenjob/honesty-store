import { getBox } from './box';
import { getItem } from './item';

const stores = new Map();
const defaultBox = getBox(0);
stores.set('sl-ncl', defaultBox);
stores.set('sl-edn', defaultBox);
stores.set('sl-brs', defaultBox);
stores.set('sl-ldn', defaultBox);

export const getPrice = itemID => getItem(itemID).price;

export const getStore = (storeCode) => {
  const store = stores.get(storeCode);
  if (store == null) {
    throw new Error(`Store does not exist with code '${storeCode}'`);
  }
  return store;
};

export const getItems = (storeCode) => {
  const box = getStore(storeCode);

  const storeItems = box.items.map(({ itemID, count }) => {
    const item = getItem(itemID);
    return {
      id: itemID,
      name: item.name,
      price: item.price,
      count,
    };
  });

  return storeItems;
};

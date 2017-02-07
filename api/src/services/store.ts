import { getBox } from './box';
import { getItem } from './item';

const stores = new Map();

stores.set('sl-ncl', getBox('032503e2-6cd3-4101-92bb-49bc26a5027e'));
stores.set('sl-edn', getBox('32e0a7e1-38b4-42ce-b29d-6c70d346089a'));
stores.set('sl-brs', getBox('32e0a7e1-38b4-42ce-b29d-6c70d346089a'));
stores.set('sl-ldn', getBox('32e0a7e1-38b4-42ce-b29d-6c70d346089a'));

export const storeList = () => Array.from(stores.keys());

export const getPrice = itemID => getItem(itemID).price;

// currently storeCode and storeID are identical
export const storeIDToStoreCode = (storeID) => storeID;
export const storeCodeToStoreID = (storeCode) => storeCode;

export const getStore = (storeCode) => {
  const store = stores.get(storeCode);
  if (store == null) {
    throw new Error(`Store does not exist with code '${storeCode}'`);
  }
  return store;
};

export const getItems = (storeCode) => {
  const box = getStore(storeCode);

  return box.items.map(({ itemID, count }) => {
    const item = getItem(itemID);
    return {
      ...item,
      id: itemID,
      count
    };
  });
};

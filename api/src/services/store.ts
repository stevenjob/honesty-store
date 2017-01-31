import { storeList } from '../../../service/src/storeList';
import { getBox } from './box';
import { getItem } from './item';

const stores = new Map();
const defaultBox = getBox(0);

storeList.forEach((store) => stores.set(store, defaultBox));

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

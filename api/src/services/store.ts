import { getBox } from './box';
import { getItem } from './item';

const stores = new Map();

const ncl = {
  boxId: '032503e2-6cd3-4101-92bb-49bc26a5027e',
  itemPrices: {
    '46ced0c0-8815-4ed2-bfb6-40537f5bd512': 50,
    'faeda516-bd9f-41ec-b949-7a676312b0ae': 40,
    'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8': 51,
    '78816fba-150d-4282-b43d-900df45cea8b': 48,
    '02bbc0fd-54c4-45bb-9b77-21b79b356aa6': 58
  }
};

const brs = {
  boxId: '32e0a7e1-38b4-42ce-b29d-6c70d346089a',
  itemPrices: {
    '28b0a802-bef3-478b-81d0-034e3ac02092': 55,
    'faeda516-bd9f-41ec-b949-7a676312b0ae': 45,
    'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8': 56,
    '78816fba-150d-4282-b43d-900df45cea8b': 53,
    '3fa0db7c-3f90-404e-b875-3792eda3e185': 65
  }
};

const edn = {
  boxId: 'df29f676-0fbb-44dd-8687-6bb2a3f5bb38',
  itemPrices: {
    '28b0a802-bef3-478b-81d0-034e3ac02092': 55,
    'faeda516-bd9f-41ec-b949-7a676312b0ae': 45,
    'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8': 56,
    '78816fba-150d-4282-b43d-900df45cea8b': 53,
    '3fa0db7c-3f90-404e-b875-3792eda3e185': 65
  }
};

const ldn = {
  boxId: '1a6b272d-7bbb-4cc6-a84f-653a5087dc0f',
  itemPrices: {
    '28b0a802-bef3-478b-81d0-034e3ac02092': 55,
    'faeda516-bd9f-41ec-b949-7a676312b0ae': 45,
    'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8': 56,
    '78816fba-150d-4282-b43d-900df45cea8b': 53,
    '3fa0db7c-3f90-404e-b875-3792eda3e185': 65
  }
};

stores.set('sl-ncl', ncl);
stores.set('sl-edn', edn);
stores.set('sl-brs', brs);
stores.set('sl-ldn', ldn);

export const storeList = () => Array.from(stores.keys());

// currently storeCode and storeID are identical
export const storeIDToStoreCode = (storeID) => storeID;
export const storeCodeToStoreID = (storeCode) => storeCode;

const getStore = (storeCode) => {
  const store = stores.get(storeCode);
  if (store == null) {
    throw new Error(`Store does not exist with code '${storeCode}'`);
  }
  return store;
};

export const getPrice = (storeCode: string, itemID: string) => {
  const store = getStore(storeCode);
  return store.itemPrices[itemID];
};

export interface StoreItem {
  name: string;
  image: string;

  count: number;

  id: string;
  price: number;
}

export const storeItems = (storeCode): StoreItem[] => {
  const store = getStore(storeCode);
  const box = getBox(store.boxId);

  return box.items.map(({ itemID, count }) => ({
    ...getItem(itemID),
    count,
    id: itemID,
    price: getPrice(storeCode, itemID)
  }));
};

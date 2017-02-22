import { getBox } from './box';
import { getItem } from './item';

const stores = new Map();

const ncl = {
  boxIds: [
    '032503e2-6cd3-4101-92bb-49bc26a5027e',
    '091be502-19ec-48f3-aad3-3091575d0fd4',
    'af02cf9f-d8b7-4d7e-a701-3addb212a7ba',
    '680a2849-4a37-47f0-88a6-b9b1df91d5f4',
    '340e5dba-309d-4f7d-b20d-f1f778883627'
  ],
  itemPrices: {
    '46ced0c0-8815-4ed2-bfb6-40537f5bd512': 50,
    'faeda516-bd9f-41ec-b949-7a676312b0ae': 40,
    'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8': 51,
    '78816fba-150d-4282-b43d-900df45cea8b': 48,
    '02bbc0fd-54c4-45bb-9b77-21b79b356aa6': 26,
    '28b0a802-bef3-478b-81d0-034e3ac02092': 50,
    '606e12d4-6367-4fc3-aa7a-92ee17ccac2c': 21,
    'e91e7274-fe28-405c-86c8-5768197eb6ac': 41,
    '32919485-d806-4be6-824b-170f66371306': 44,
    '272c6a59-9b4c-41b6-b839-0f8be506728e': 99,
    '8e9bb2db-9437-4733-acc1-f5e218e0a603': 39,
    'cf7a7886-c30d-4760-8c15-39adb2dc8649': 33,
    'd5d10152-3f8a-419b-9abd-6d6e916ea64a': 22,
    '3b7a6669-770c-4dbb-97e2-0e0aae3ca5ff': 27
  }
};

const brs = {
  boxIds: [
    '32e0a7e1-38b4-42ce-b29d-6c70d346089a'
  ],
  itemPrices: {
    '28b0a802-bef3-478b-81d0-034e3ac02092': 55,
    'faeda516-bd9f-41ec-b949-7a676312b0ae': 45,
    'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8': 56,
    '78816fba-150d-4282-b43d-900df45cea8b': 53,
    '3fa0db7c-3f90-404e-b875-3792eda3e185': 65
  }
};

const edn = {
  boxIds: [
    'df29f676-0fbb-44dd-8687-6bb2a3f5bb38'
  ],
  itemPrices: {
    '28b0a802-bef3-478b-81d0-034e3ac02092': 55,
    'faeda516-bd9f-41ec-b949-7a676312b0ae': 45,
    'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8': 56,
    '78816fba-150d-4282-b43d-900df45cea8b': 53,
    '3fa0db7c-3f90-404e-b875-3792eda3e185': 65
  }
};

const ldn = {
  boxIds: [
    '1a6b272d-7bbb-4cc6-a84f-653a5087dc0f'
  ],
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

const getUniqueItemCounts = (boxes) => {
  const map = new Map<string, number>();
  for (const box of boxes) {
    if (box.closed != null) {
      continue;
    }
    for (const { itemID, count } of box.items) {
      const existingCount = map.has(itemID) ? map.get(itemID) : 0;
      map.set(itemID, existingCount + <number>count);
    }
  }
  return Array.from(map.entries())
    .map(([itemID, count]) => ({ itemID, count }));
};

export const storeItems = (storeCode): StoreItem[] => {
  const store = getStore(storeCode);
  const boxes = store.boxIds.map(getBox);

  return getUniqueItemCounts(boxes)
    .map(({ itemID, count }) => ({
      ...getItem(itemID),
      count,
      id: itemID,
      price: getPrice(storeCode, itemID)
    }));
};

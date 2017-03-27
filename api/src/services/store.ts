import { Box, BoxItem, getBox } from '../../../box/src/client';
import { avg } from '../../../box/src/math';
import { getItem } from './item';

interface Store {
  boxIds: string[];
  itemPrices: { [id: string]: number };
}

export interface StoreItem {
  name: string;
  image: string;

  count: number;

  id: string;
  price: {
    total: number;
    breakdown: PriceBreakdown;
  };
}

interface PriceBreakdown {
  creditCardFee: number;
  VAT: number;

  shippingCost: number;
  warehousingCost: number;
  packagingCost: number;
  packingCost: number;
  serviceFee: number;
}

const stores = new Map<string, Store>();

const ncl = {
  boxIds: [
    '032503e2-6cd3-4101-92bb-49bc26a5027e',
    '091be502-19ec-48f3-aad3-3091575d0fd4',
    'af02cf9f-d8b7-4d7e-a701-3addb212a7ba',
    '680a2849-4a37-47f0-88a6-b9b1df91d5f4',
    '340e5dba-309d-4f7d-b20d-f1f778883627',
    '67bd2798-87d0-4208-9845-4f35da29f144',
    'f6cbf4c2-ead1-430a-afa6-dcf1d10f3e66',
    '7dda507a-b909-4b28-afc0-4e3dd972196a',
    '0b7d4fd1-91d8-4f9e-af8a-e62129bf7d64',
    'f9f4c9d7-97a3-428b-b960-cb27d4054964',
    'ad355820-b7c1-4d9f-ae9d-15a3fccc7808'
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
    'cf7a7886-c30d-4760-8c15-39adb2dc8649': 31,
    'd5d10152-3f8a-419b-9abd-6d6e916ea64a': 31,
    '3b7a6669-770c-4dbb-97e2-0e0aae3ca5ff': 11,
    'ccad58e3-e27a-4463-9139-17a36ff7f7b8': 31,
    '96ce1162-9188-41ac-9d35-8fc6a14783ef': 38,
    'e615de4e-ce10-451b-80ad-9717662a904a': 32
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
    'df29f676-0fbb-44dd-8687-6bb2a3f5bb38',
    'e61ec9c5-e11c-4656-9d4f-0ce92bd5f0f2'
  ],
  itemPrices: {
    '28b0a802-bef3-478b-81d0-034e3ac02092': 55,
    'faeda516-bd9f-41ec-b949-7a676312b0ae': 45,
    'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8': 56,
    '78816fba-150d-4282-b43d-900df45cea8b': 59,
    '3fa0db7c-3f90-404e-b875-3792eda3e185': 63,
    '8fd928e0-06c9-4958-9259-719dc451a8c2': 62,
    'edef6848-f3d5-4733-babc-bc10bc3d257c': 62,
    '64e177af-6313-4d9e-b39a-8495c2f1d939': 54,
    '54e10706-284f-440f-82cb-0f8911a8424a': 78,
    '80984458-bab9-4a8f-86a7-b3e46f62139d': 78,
    '5298c925-9ae2-4017-a007-c1928c38ddc6': 57,
    'f0167eb4-f906-48d8-8067-6e3b646d8a19': 91,
    'fc3f3a7a-64bc-4f23-9a4e-c90f2536e56b': 90
  }
};

const ldn = {
  boxIds: [
    '1a6b272d-7bbb-4cc6-a84f-653a5087dc0f',
    '239d69df-2e4b-444b-ad45-14bf7b944af7'
  ],
  itemPrices: {
    '28b0a802-bef3-478b-81d0-034e3ac02092': 55,
    'faeda516-bd9f-41ec-b949-7a676312b0ae': 45,
    'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8': 56,
    '78816fba-150d-4282-b43d-900df45cea8b': 53,
    '3fa0db7c-3f90-404e-b875-3792eda3e185': 65,
    '8fd928e0-06c9-4958-9259-719dc451a8c2': 71,
    'edef6848-f3d5-4733-babc-bc10bc3d257c': 71,
    '64e177af-6313-4d9e-b39a-8495c2f1d939': 69,
    '54e10706-284f-440f-82cb-0f8911a8424a': 87,
    '80984458-bab9-4a8f-86a7-b3e46f62139d': 87,
    '32a9520f-f407-42ee-9bc5-ab9e2a9c76ea': 87,
    'f0167eb4-f906-48d8-8067-6e3b646d8a19': 100,
    'fc3f3a7a-64bc-4f23-9a4e-c90f2536e56b': 99,
    'b78c3975-eb7f-4eda-a3ea-d54d35e6471e': 70,
    '5298c925-9ae2-4017-a007-c1928c38ddc6': 85
  }
};

const test = {
  boxIds: [
    '06439c6c-57c9-4a17-b218-2018ea8dae55',
    'a7a863c6-9974-475d-96e9-4b4078a2e1c2',
    '5b3b4683-918e-49b1-bc68-9c33a5bbdf33'
  ],
  itemPrices: {
    '46ced0c0-8815-4ed2-bfb6-40537f5bd512': 30,
    'faeda516-bd9f-41ec-b949-7a676312b0ae': 51,
    'cf7a7886-c30d-4760-8c15-39adb2dc8649': 130
  }
};

stores.set('sl-ncl', ncl);
stores.set('sl-edn', edn);
stores.set('sl-brs', brs);
stores.set('sl-ldn', ldn);
stores.set('dev-test', test);
// Second test box to allow testing of store switching in test environment
stores.set('dev-test-2', test);

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

export const storeBoxIds = (storeCode) => {
  const store = getStore(storeCode);
  return store.boxIds;
};

export const getPrice = (storeCode: string, itemID: string) => {
  const store = getStore(storeCode);
  return store.itemPrices[itemID];
};

const getUniqueItemCounts = (boxes: Box[]) => {
  const map = new Map<string, number>();
  for (const box of boxes) {
    if (box.closed != null) {
      continue;
    }
    for (const { itemID, count, depleted } of box.boxItems) {
      const existingCount = map.has(itemID) ? map.get(itemID) : 0;
      map.set(itemID, existingCount + (depleted ? 0 : count));
    }
  }
  return Array.from(map.entries())
    .map(([itemID, count]) => ({ itemID, count }));
};

const boxesContainingItem = (boxes: Box[], itemId) =>
  boxes.filter(({ boxItems }) => boxItems.some( ({ itemID }) => itemId === itemID));

const itemAvg = (boxItems: BoxItem[], extractValue: (_: BoxItem) => number): number =>
  avg(boxItems, item => ({ count: item.count, value: extractValue(item) }));

const priceBreakdown = (boxes: Box[], itemID): PriceBreakdown => {
  const items = boxesContainingItem(boxes, itemID)
    .map(({ boxItems }) => boxItems)
    .reduce((acc, ar) => [...acc, ...ar], [])
    .filter(({ itemID: id }) => id === itemID);

  return {
    creditCardFee: itemAvg(items, item => item.creditCardFee),
    VAT: itemAvg(items, item => item.VAT),
    shippingCost: itemAvg(items, item => item.shippingCost),
    warehousingCost: itemAvg(items, item => item.warehousingCost),
    packagingCost: itemAvg(items, item => item.packagingCost),
    packingCost: itemAvg(items, item => item.packingCost),
    serviceFee: itemAvg(items, item => item.serviceFee)
  };
};

export const storeItems = async (key, storeCode): Promise<StoreItem[]> => {
  const store = getStore(storeCode);
  const boxes = await Promise.all(store.boxIds.map((boxId) => getBox(key, boxId)));

  return getUniqueItemCounts(boxes)
    .map(({ itemID, count }) => ({
      ...getItem(itemID),
      count,
      id: itemID,
      price: {
        total: getPrice(storeCode, itemID),
        breakdown: priceBreakdown(boxes, itemID)
      }
    }));
};

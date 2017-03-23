import { Box, BoxItem, getBoxesForStore } from '../../../box/src/client';
import { avg } from '../../../box/src/math';
import { getItem } from './item';

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

const stores = ['sl-ncl', 'sl-edn', 'sl-brs', 'sl-ldn', 'dev-test', 'dev-test-2'];

// currently storeCode and storeID are identical
export const storeIDToStoreCode = (storeID) => storeID;
export const storeCodeToStoreID = (storeCode) => storeCode;

const assertValidStoreCode = (storeCode) => {
  if (!stores.some(el => el === storeCode)) {
    throw new Error(`Store does not exist with code '${storeCode}'`);
  }
};

const getItemPriceFromBoxes = (boxes: Box[], itemID: string) => {
  const boxesWithItem = boxesContainingItem(boxes, itemID);

  if (boxesWithItem.length === 0) {
    throw new Error(`No boxes found containing item ${itemID}`);
  }

  let oldestBox: Box;

  for (const box of boxesWithItem) {
    console.log(box);
    if (oldestBox == null || box.received < oldestBox.received) {
      oldestBox = box;
    }
  }

  const boxItem = oldestBox.boxItems.find((el) => el.itemID === itemID);
  return boxItem.total;
}

export const getItemPriceFromStore = async (key, storeCode: string, itemIDToFind: string) => {
  assertValidStoreCode(storeCode);
  const boxes = await getBoxesForStore(key, storeCode);
  return getItemPriceFromBoxes(boxes, itemIDToFind);
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
  const boxes = await getBoxesForStore(key, storeCode)
  const openBoxes = boxes.filter(({ closed }) => closed == null);

  return Promise.all(
    getUniqueItemCounts(boxes)
      .map(async ({ itemID, count }) => ({
        ...getItem(itemID),
        count,
        id: itemID,
        price: {
          total: getItemPriceFromBoxes(openBoxes, itemID),
          breakdown: priceBreakdown(boxes, itemID)
        }
      }))
  );
};

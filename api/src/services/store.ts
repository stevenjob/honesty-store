import { Box, BoxItem, getBoxesForStore } from '../../../box/src/client';
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

export const storeList = ['sl-ncl', 'sl-edn', 'sl-brs', 'sl-ldn', 'dev-test', 'dev-test-2'];

// currently storeCode and storeID are identical
export const storeIDToStoreCode = (storeID) => storeID;
export const storeCodeToStoreID = (storeCode) => storeCode;

const assertValidStoreCode = (storeCode) => {
  if (!storeList.some(el => el === storeCode)) {
    throw new Error(`Store does not exist with code '${storeCode}'`);
  }
};

const extractBoxItems = (boxes: Box[], itemId: string, matchingCondition = (_boxItem: BoxItem) => true) => {
  const extractBoxItem = (box: Box, itemID: string) => box.boxItems.find((el) => el.itemID === itemID);
  return boxes.filter(({ boxItems }) => boxItems.some((e) => e.itemID === itemId && matchingCondition(e)))
    .reduce(
      (existing, current) => {
        const boxItem = extractBoxItem(current, itemId);
        return [...existing, boxItem];
      },
      [] as BoxItem[]
    );
};

export const getBoxItem = (boxes: Box[], itemID: string): BoxItem => {
  const boxesByDateReceived = boxes.sort((a, b) => a.received - b.received);
  const inStockBoxItems = extractBoxItems(boxesByDateReceived, itemID, (({ depleted }) => depleted == null ));

  if (inStockBoxItems.length === 0) {
    const itemsByDateReceived = extractBoxItems(boxesByDateReceived, itemID);
    const itemsByDateMarkedDepleted = itemsByDateReceived.sort((a, b) => b.depleted - a.depleted);

    const mostRecentDepletion = itemsByDateMarkedDepleted[0].depleted;
    const itemsMarkedDepletedOnDate = itemsByDateMarkedDepleted.filter(({ depleted }) => depleted === mostRecentDepletion );

    return itemsMarkedDepletedOnDate.length > 1 ? itemsByDateReceived[0] : itemsByDateMarkedDepleted[0];
  }
  return inStockBoxItems[0];
};

export const getItemPriceFromStore = async (key, storeCode: string, itemID: string) => {
  assertValidStoreCode(storeCode);
  const boxes = await getBoxesForStore(key, storeCode);
  const { total } = getBoxItem(boxes, itemID);
  return total;
};

const getUniqueItemCounts = (boxes: Box[]) => {
  const map = new Map<string, number>();
  for (const box of boxes) {
    for (const { itemID, count, depleted } of box.boxItems) {
      const existingCount = map.has(itemID) ? map.get(itemID) : 0;
      map.set(itemID, existingCount + (depleted ? 0 : count));
    }
  }
  return Array.from(map.entries())
    .map(([itemID, count]) => ({ itemID, count }));
};

const getPriceBreakdown = (boxItem: BoxItem): PriceBreakdown => {
  const {
    creditCardFee,
    VAT,
    shippingCost,
    warehousingCost,
    packagingCost,
    packingCost,
    serviceFee
  } = boxItem;

  return {
    creditCardFee,
    VAT,
    shippingCost,
    warehousingCost,
    packagingCost,
    packingCost,
    serviceFee
  };
};

export const storeItems = async (key, storeCode): Promise<StoreItem[]> => {
  const openBoxes = (await getBoxesForStore(key, storeCode))
    .filter(({ closed }) => closed == null);

  return Promise.all(
    getUniqueItemCounts(openBoxes)
      .map(async ({ itemID, count }) => {
        const boxItem = getBoxItem(openBoxes, itemID);
        const { total } = boxItem;
        const breakdown = getPriceBreakdown(boxItem);

        return ({
          ...getItem(itemID),
          count,
          id: itemID,
          price: {
            total,
            breakdown
          }
        });
      })
  );
};

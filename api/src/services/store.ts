import { getBatch, isMarketplaceBatch } from '@honesty-store/batch/src/client';
import { Box, BoxItem, getBoxesForStore } from '@honesty-store/box/src/client';
import { getItem, Item } from '@honesty-store/item/src/client';

export interface StoreItem {
  name: string;
  image: string;

  count: number;

  id: string;
  expiry: number;
  price: {
    total: number;
    breakdown: PriceBreakdown;
  };
}

interface PriceBreakdown {
  wholesaleCost: number;
  handlingFee: number;
  serviceFee: number;
  creditCardFee: number;
  VAT: number;
  donation: number;

  // Deprecated
  shippingCost: number;
  warehousingCost: number;
  packagingCost: number;
  packingCost: number;
}

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

const mostExpensiveBoxItem = (boxes: Box[], itemID: string): BoxItem => {
  const mostExpensive = (items: BoxItem[]) =>
    items.reduce((top, item) => top.total > item.total ? top : item);

  const inStockItems = extractBoxItems(boxes, itemID, (({ depleted }) => depleted == null ));
  if (inStockItems.length) {
    return mostExpensive(inStockItems);
  }
  return mostExpensive(extractBoxItems(boxes, itemID));
};

export const boxIsReceivedAndOpen = (box) => box.closed == null && box.received != null;

export const getItemPriceFromStore = async (key, storeId: string, itemID: string) => {
  const boxes = await getBoxesForStore(key, storeId, boxIsReceivedAndOpen);
  const { total } = mostExpensiveBoxItem(boxes, itemID);
  return total;
};

const getPriceBreakdown = (boxItem: BoxItem): PriceBreakdown => {
  const {
    creditCardFee,
    VAT,
    shippingCost,
    warehousingCost,
    packagingCost,
    packingCost,
    serviceFee,
    wholesaleCost,
    donation
  } = boxItem;

  const handlingFee = warehousingCost + packagingCost + packingCost + shippingCost;

  return {
    creditCardFee,
    VAT,
    shippingCost,
    warehousingCost,
    packagingCost,
    packingCost,
    serviceFee,
    wholesaleCost,
    donation,
    handlingFee
  };
};

export const storeItems = async (key, storeId): Promise<StoreItem[]> => {
  const openBoxes = await getBoxesForStore(key, storeId, boxIsReceivedAndOpen);

  const items = await Promise.all(openBoxes.map(({ boxItems }) =>
      boxItems.map(async ({ itemID: itemId, count, depleted, batches }) => {
        const [ item, batch ] = await Promise.all([
          getItem(key, itemId),
          getBatch(key, batches[0].id)
        ]);

        return {
          ...item,
          count: depleted ? 0 : count,
          isMarketplace: batches.length === 1 && isMarketplaceBatch(batch)
        };
      }))
    .reduce((acc, promises) => acc.concat(promises), []));

  const uniqueItems = Array.from(items.reduce((map, item) => {
      const existing = map.get(item.id);

      if (!existing) {
        map.set(item.id, item);
      } else {
        map.set(item.id, {
          ...existing,
          ...item,
          isMarketplace: existing.isMarketplace && item.isMarketplace,
          count: existing.count + item.count
        });
      }

      return map;
    },
    // tslint:disable-next-line:align
    new Map<string, Item & { count: number, isMarketplace: boolean }>())
    .values());

  return uniqueItems.map(item => {
    const mostRecentInstance = mostExpensiveBoxItem(openBoxes, item.id);
    const { total, expiry } = mostRecentInstance;
    const breakdown = getPriceBreakdown(mostRecentInstance);

    return {
      ...item,
      expiry,
      price: {
        total,
        breakdown
      }
    };
  });
};

import { getBatch, isMarketplaceBatch } from '../../../batch/src/client';
import { Box, BoxItem, getBoxesForStore } from '../../../box/src/client';
import { getItem, Item } from '../../../item/src/client';

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

const mostRecentBoxItem = (boxes: Box[], itemID: string): BoxItem => {
  const boxesByDateReceived = boxes.slice().sort((a, b) => a.received - b.received);
  const inStockBoxItems = extractBoxItems(boxesByDateReceived, itemID, (({ depleted }) => depleted == null ));

  if (inStockBoxItems.length === 0) {
    const itemsByDateReceived = extractBoxItems(boxesByDateReceived, itemID);
    const itemsByDateMarkedDepleted = itemsByDateReceived.slice().sort((a, b) => b.depleted - a.depleted);

    const mostRecentDepletion = itemsByDateMarkedDepleted[0].depleted;
    const itemsMarkedDepletedOnDate = itemsByDateMarkedDepleted.filter(({ depleted }) => depleted === mostRecentDepletion );

    return itemsMarkedDepletedOnDate.length > 1 ? itemsByDateReceived[0] : itemsByDateMarkedDepleted[0];
  }
  return inStockBoxItems[0];
};

export const boxIsReceivedAndOpen = (box) => box.closed == null && box.received != null;

export const getItemPriceFromStore = async (key, storeId: string, itemID: string) => {
  const boxes = await getBoxesForStore(key, storeId, boxIsReceivedAndOpen);
  const { total } = mostRecentBoxItem(boxes, itemID);
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
    const mostRecentInstance = mostRecentBoxItem(openBoxes, item.id);
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

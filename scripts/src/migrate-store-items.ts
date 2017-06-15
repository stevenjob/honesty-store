import { getBatch, isMarketplaceBatch } from '@honesty-store/batch/src/client';
import { Box, BoxItem, getBoxesForStore } from '@honesty-store/box/src/client';
import { getItem, Item } from '@honesty-store/item/src/client';
import { createServiceKey } from '@honesty-store/service/src/key';
import { listItem, StoreItemListing } from '@honesty-store/store/src/client';

export interface StoreItem extends Item {
  name: string;
  image: string;

  isMarketplace: boolean;
  sellerId: string;

  count: number;

  id: string;
  expiry: number;
  price: {
    total: number;
    breakdown: PriceBreakdown;
  };
}

export interface PriceBreakdown {
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

  const inStockItems = extractBoxItems(boxes, itemID, (({ depleted }) => depleted == null));
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
      const [item, batch] = await Promise.all([
        getItem(key, itemId),
        getBatch(key, batches[0].id)
      ]);

      const isMarketplace = batches.length === 1 && isMarketplaceBatch(batch);

      const hhudsonUser = '77a68b8a-97bb-4c04-a823-31e6fd8d7df5';
      const cpriceUser = 'f9c8b541-0a30-4adc-8e0d-887e6db9f301';
      const dummyUser = '9127e1db-2a2c-41c5-908f-781ac816b633';

      const pseudoMarketplace = isMarketplace && batch.supplierCode !== hhudsonUser && batch.supplierCode !== cpriceUser;

      const sellerId = pseudoMarketplace ? batch.supplierCode : dummyUser;

      return {
        ...item,
        count: depleted ? 0 : count,
        isMarketplace,
        sellerId
      };
    }))
    .reduce((acc, promises) => acc.concat(promises), []));

  const uniqueItems = Array.from(items.reduce((map, item) => {
    const existing = map.get(item.id);

    if (!existing) {
      map.set(item.id, item);
    } else {
      if (existing.sellerId !== item.sellerId) {
        throw new Error(`Mismatch in sellerId ${existing.id} ${existing.sellerId} ${item.id} ${item.sellerId}`);
      }
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
    new Map<string, Item & { count: number, isMarketplace: boolean, sellerId: string }>())
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

const key = createServiceKey({ service: 'migrate-script' });

const codes = {
  // 'sl-edn': 'f79ff70c-2103-43f9-922d-d54a16315361',
  // 'sl-ncl': 'b8d7305b-bb7d-4bbe-8b2f-5e94c6267bb6',
  // 'sl-ldn': '1cfb21d8-52d8-4eee-98ce-740c466bfc0e',
  // 'sl-brs': '9a61dad3-f05c-46aa-a7e4-14311e9cccc5',
  'dev-test': '1e7c9c0d-a9be-4ab7-8499-e57bf859978d'
};

const list = async () => {
  for (const code of Object.keys(codes)) {
    const storeId = codes[code];

    const items = await storeItems(key, storeId);

    const listings = items.map<StoreItemListing>(item => ({
      id: item.id,
      name: item.name,
      qualifier: item.qualifier,
      genericName: item.genericName,
      genericNamePlural: item.genericNamePlural,
      unit: item.unit,
      unitPlural: item.unitPlural,
      image: item.image,
      listCount: 1e3,
      price: item.price.total,
      sellerId: item.sellerId
    }));

    for (const listing of listings) {
      await listItem(key, storeId, listing);
    }
  }
};

list()
  .then(console.log)
  .catch(console.error);

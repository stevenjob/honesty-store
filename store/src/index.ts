import { config } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

import { default as cruft, EnhancedItem } from '@honesty-store/cruft/src/index';
import {
  assertNever,
  assertNonZeroPositiveInteger,
  assertPositiveInteger,
  assertValidString,
  assertValidUuid,
  createAssertValidObject
} from '@honesty-store/service/src/assert';
import { CodedError } from '@honesty-store/service/src/error';
import { createServiceKey } from '@honesty-store/service/src/key';
import { lambdaRouter } from '@honesty-store/service/src/lambdaRouter';
import { error } from '@honesty-store/service/src/log';
import { assertValidTransaction, Transaction } from '@honesty-store/transaction/src/client';

import {
  Store,
  StoreEvent,
  StoreItem,
  StoreItemAudited,
  StoreItemListed,
  StoreItemListing,
  StoreItemPriceChanged,
  StoreItemUnlisted
} from './client';

config.region = process.env.AWS_REGION;

const { read, reduce, find } = cruft<Store>({
  tableName: process.env.TABLE_NAME
});

const lookupItem = (store: Store, itemId: string): StoreItem | undefined =>
  store.items.find(({ id }) => itemId === id);

const reducer = reduce<Transaction | StoreEvent>(
  event => {
    switch (event.type) {
      case 'purchase':
      case 'refund':
        return event.data.storeId;
      case 'topup':
        throw new Error(`Unable to handle topup transactions ${event.id}`);
      case 'store-audit':
      case 'store-price-change':
      case 'store-list':
      case 'store-unlist':
        return event.storeId;
      default:
        return assertNever(event);
    }
  },
  event => event.id,
  (store, event) => {
    const key = createServiceKey({ service: 'store' });
    switch (event.type) {
      case 'purchase': {
        const { id, type, data: { itemId }, data } = event;

        const item = lookupItem(store, itemId);

        if (item == null) {
          error(key, `Event ${type} ${id} for non-existent item ${itemId} in ${store.id}`);
          return store;
        }

        const quantity = Number(data.quantity);

        item.availableCount -= quantity;
        item.purchaseCount += quantity;

        return store;
      }
      case 'refund': {
        const { id, type, data: { itemId }, data } = event;

        const item = lookupItem(store, itemId);

        if (item == null) {
          error(key, `Event ${type} ${id} for non-existent item ${itemId} in ${store.id}`);
          return store;
        }

        const quantity = Number(data.quantity);

        item.availableCount += quantity;
        item.refundCount += quantity;

        return store;
      }
      case 'topup': {
        throw new Error(`Unable to handle topup transactions ${event.id}`);
      }
      case 'store-audit': {
        const { id, type, itemId, count } = event;

        const item = lookupItem(store, itemId);

        if (item == null) {
          error(key, `Event ${type} ${id} for non-existent item ${itemId} in ${store.id}`);
          return store;
        }

        item.availableCount = count;

        return store;
      }
      case 'store-price-change': {
        const { id, type, itemId, price } = event;

        const item = lookupItem(store, itemId);

        if (item == null) {
          error(key, `Event ${type} ${id} for non-existent item ${itemId} in ${store.id}`);
          return store;
        }

        item.price = price;

        return store;
      }
      case 'store-list': {
        const { listing } = event;

        const existingItem = lookupItem(store, listing.id);

        if (existingItem != null) {
          throw new Error(`Listing already exists ${listing.id} in ${store.id}`);
        }

        const item: StoreItem = {
          ...listing,
          availableCount: listing.listCount,
          purchaseCount: 0,
          refundCount: 0
        };

        store.items.push(item);

        return store;
      }
      case 'store-unlist': {
        const { itemId } = event;

        const unlistedItem = lookupItem(store, itemId);

        if (unlistedItem == null) {
          throw new Error(`Listing does not exist ${itemId} in ${store.id}`);
        }

        store.items = store.items.filter(item => item !== unlistedItem);

        return store;
      }
      default:
        return assertNever(event);
    }
  }
);

export const router = lambdaRouter('store', 1);

const externalise = (store: EnhancedItem<Store>): Store => ({
  id: store.id,
  version: store.version,
  code: store.code,
  agentId: store.agentId,
  items: store.items
});

router.get<Store>(
  '/code/:code',
  async (_key, { code }) => {
    try {
      return externalise(await find({ code }));
    } catch (e) {
      throw new CodedError('StoreNotFound', `No store found with code ${code} - ${e.message}`);
    }
  }
);

router.get<Store>(
  '/:id',
  async (_key, { id }) => {
    try {
      return externalise(await read(id));
    } catch (e) {
      throw new CodedError('StoreNotFound', `No store found with id ${id} - ${e.message}`);
    }
  }
);

const assertValidStoreItemListing = createAssertValidObject<StoreItemListing>({
  id: assertValidUuid,
  sellerId: assertValidUuid,
  listCount: assertNonZeroPositiveInteger,
  name: assertValidString,
  qualifier: assertValidString,
  genericName: assertValidString,
  genericNamePlural: assertValidString,
  unit: assertValidString,
  unitPlural: assertValidString,
  image: assertValidString,
  price: assertNonZeroPositiveInteger
});

router.post<StoreItemListing, Store>(
  '/:storeId/item',
  async (_key, { storeId }, listing) => {
    assertValidUuid('storeId', storeId);
    assertValidStoreItemListing(listing);

    const event: StoreItemListed = {
      id: uuid(),
      type: 'store-list',
      storeId,
      listing
    };

    return externalise(await reducer(event));
  }
);

router.post<Transaction, Store>(
  '/transaction',
  async (_key, {  }, transaction) => {
    assertValidTransaction(transaction);

    return externalise(await reducer(transaction));
  }
);

router.post<{ price: number }, Store>(
  '/:storeId/:itemId',
  async (_key, { storeId, itemId }, { price }) => {
    assertValidUuid('storeId', storeId);
    assertValidUuid('itemId', itemId);
    assertNonZeroPositiveInteger('price', price);

    const event: StoreItemPriceChanged = {
      id: uuid(),
      type: 'store-price-change',
      storeId,
      itemId,
      price
    };

    return externalise(await reducer(event));
  }
);

router.post<{ count: number, userId: string }, Store>(
  '/:storeId/:itemId/count',
  async (_key, { storeId, itemId }, { count, userId }) => {
    assertValidUuid('storeId', storeId);
    assertValidUuid('itemId', itemId);
    assertPositiveInteger('count', count);
    assertValidUuid('userId', userId);

    const event: StoreItemAudited = {
      id: uuid(),
      type: 'store-audit',
      storeId,
      itemId,
      userId,
      count
    };

    return externalise(await reducer(event));
  }
);

router.post<{ count: number, userId: string }, Store>(
  '/:storeId/:itemId/unlist',
  async (_key, { storeId, itemId }, { }) => {
    assertValidUuid('storeId', storeId);
    assertValidUuid('itemId', itemId);

    const event: StoreItemUnlisted = {
      id: uuid(),
      type: 'store-unlist',
      storeId,
      itemId
    };

    return externalise(await reducer(event));
  }
);

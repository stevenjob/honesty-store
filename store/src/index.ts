import { config } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

import { default as cruft, EnhancedItem } from '@honesty-store/cruft/lib/index';
import {
  assertNever,
  assertNonZeroPositiveInteger,
  assertOptional,
  assertPositiveInteger,
  assertValidString,
  assertValidUuid,
  createAssertValidObject,
  ObjectValidator
} from '@honesty-store/service/lib/assert';
import { CodedError } from '@honesty-store/service/lib/error';
import { createServiceKey } from '@honesty-store/service/lib/key';
import { lambdaRouter, LambdaRouter } from '@honesty-store/service/lib/lambdaRouter';
import { error } from '@honesty-store/service/lib/log';
import { assertValidTransaction, Transaction } from '@honesty-store/transaction';

import {
  calculateServiceFee,
  Store,
  StoreEvent,
  StoreItem,
  StoreItemAudited,
  StoreItemDetails,
  StoreItemDetailsChanged,
  StoreItemListed,
  StoreItemListing,
  StoreItemUnlisted
} from './client';

config.region = process.env.AWS_REGION;

const { read, reduce, find } = cruft<Store>({
  tableName: process.env.TABLE_NAME,
  limit: 100
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
      case 'debit':
      case 'credit':
        throw new Error(`Unable to handle ${event.type} transactions ${event.id}`);
      case 'store-audit':
      case 'store-details-change':
      case 'store-list':
      case 'store-unlist':
        return event.storeId;
      default:
        return assertNever(event);
    }
  },
  event => event.id,
  (store, event, _emit) => {
    const key = createServiceKey({ service: 'store' });
    switch (event.type) {
      case 'purchase': {
        const { id, type, amount, data: { itemId }, data } = event;

        const item = lookupItem(store, itemId);

        if (item == null) {
          error(key, `Event ${type} ${id} for non-existent item ${itemId} in ${store.id}`);
          return store;
        }

        const quantity = Number(data.quantity);
        const price = -amount;
        const revenue = price - calculateServiceFee(price);

        item.availableCount -= quantity;
        item.purchaseCount += quantity;
        item.revenue += revenue;

        return store;
      }
      case 'refund': {
        const { id, type, amount, data: { itemId }, data } = event;

        const item = lookupItem(store, itemId);

        if (item == null) {
          error(key, `Event ${type} ${id} for non-existent item ${itemId} in ${store.id}`);
          return store;
        }

        const quantity = Number(data.quantity);
        const price = -amount;
        const revenue = price - calculateServiceFee(price);

        item.availableCount += quantity;
        item.refundCount += quantity;
        item.revenue -= revenue;

        return store;
      }
      case 'topup': {
        throw new Error(`Unable to handle topup transactions ${event.id}`);
      }
      case 'credit':
      case 'debit': {
        throw new Error(`Unable to handle transfer transactions ${event.id}`);
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
      case 'store-details-change': {
        const {
          id,
          type,
          itemId,
          ...details
        } = event;

        const existingItem = lookupItem(store, itemId);

        if (existingItem == null) {
          error(key, `Event ${type} ${id} for non-existent item ${itemId} in ${store.id}`);
          return store;
        }

        store.items = store.items.filter(item => item !== existingItem);

        const updatedItem: StoreItem = {
          ...existingItem,
          ...details
        };

        store.items.push(updatedItem);

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
          refundCount: 0,
          revenue: 0
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

export const router: LambdaRouter = lambdaRouter('store', 1);

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

const storeDetailsValidator: ObjectValidator<StoreItemDetails> = {
  name: assertValidString,
  qualifier: assertOptional(assertValidString),
  genericName: assertValidString,
  genericNamePlural: assertValidString,
  unit: assertValidString,
  unitPlural: assertValidString,
  image: assertValidString,
  price: assertNonZeroPositiveInteger
};

const assertValidStoreItemListing = createAssertValidObject<StoreItemListing>({
  id: assertValidUuid,
  sellerId: assertValidUuid,
  listCount: assertNonZeroPositiveInteger,
  ...storeDetailsValidator
});

const assertValidStoreItemDetails = createAssertValidObject<StoreItemDetails>(storeDetailsValidator);

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

router.post<StoreItemDetails, Store>(
  '/:storeId/:itemId',
  async (_key, { storeId, itemId }, details) => {
    assertValidUuid('storeId', storeId);
    assertValidUuid('itemId', itemId);
    assertValidStoreItemDetails(details);

    const event: StoreItemDetailsChanged = {
      id: uuid(),
      type: 'store-details-change',
      storeId,
      itemId,
      ...details
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

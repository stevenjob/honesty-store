import { EnhancedItem, default as cruft } from '@honesty-store/cruft/src/index';
import { createAssertValidObject, assertValidUuid, assertValidString, assertPositiveInteger } from '@honesty-store/service/src/assert';
import { CodedError } from '@honesty-store/service/src/error';
import { error } from '@honesty-store/service/src/log';
import { lambdaRouter } from '@honesty-store/service/src/lambdaRouter';
import { Transaction } from '@honesty-store/transaction/src/client';
import { config } from 'aws-sdk';

import { Store, StoreItem, StoreItemDetails, StoreItemListing } from './client';

config.region = process.env.AWS_REGION;

const { read, reduce, update, find } = cruft<Store>({
  tableName: process.env.TABLE_NAME
});

export const router = lambdaRouter('store', 1);

const assertValidStoreItemDetails = createAssertValidObject<StoreItemDetails>({
  name: assertValidString,
  qualifier: assertValidString,
  genericName: assertValidString,
  genericNamePlural: assertValidString,
  unit: assertValidString,
  unitPlural: assertValidString,
  image: assertValidString,
  price: assertPositiveInteger
});

const assertValidStoreItemListing = createAssertValidObject<StoreItemListing>({
  id: assertValidUuid,
  sellerId: assertValidUuid,
  listCount: assertPositiveInteger,
  name: assertValidString,
  qualifier: assertValidString,
  genericName: assertValidString,
  genericNamePlural: assertValidString,
  unit: assertValidString,
  unitPlural: assertValidString,
  image: assertValidString,
  price: assertPositiveInteger
});

const externalise = (store: EnhancedItem<Store>): Store => ({
  id: store.id,
  version: store.version,
  code: store.code,
  agentId: store.agentId,
  items: store.items
});

/*
quantity: String(quantity),
itemId: itemID,
userId: userID,
storeId: storeID
*/

const reducer = reduce<Transaction & { type: 'topup' | 'refund', data: { itemId: string, quantity: number, storeId: string } }>(
  event => event.data.storeId,
  event => `transaction:${event.id}`,
  (store, transaction) => {

    const itemIndex = store.items.findIndex(item => item.id === transaction.data.itemId);

    if (itemIndex < 0) {
      error()
    }

    return store;
  }
);

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

router.post<StoreItemListing, Store>(
  '/:storeId/item',
  async (_key, { storeId }, listing: StoreItemListing) => {
    assertValidStoreItemListing(listing);

    const store = await read(storeId);

    const existingListing = store.items.find(item => item.id === listing.id);

    if (existingListing) {
      throw new Error(`Listing already exists ${listing.id}`);
    }

    const item: StoreItem = {
      ...listing,
      availableCount: listing.listCount,
      purchaseCount: 0,
      refundCount: 0,
      transactionIds: []
    };

    const updatedStore = {
      ...store,
      items: [item, ...store.items]
    };

    return externalise(await update(updatedStore));
  }
);

// export const recordTransaction = (key, transaction: Transaction) =>
//   post<Store>(1, key, `/${transaction.data.storeId}/transaction`, transaction);

// // seller only
// export const updateItemDetails = (key, storeId: string, itemId: string, details: StoreItemDetails) =>
//   post<Store>(1, key, `/${storeId}/${itemId}`, details);

// // anyone (audit maintained locally), availableCount can never exceed listCount - purchaseCount + refundCount
// export const updateItemCount = (key, storeId: string, itemId: string, count: number, userId: string) =>
//   post<Store>(1, key, `/${storeId}/${itemId}/count`, { count, userId });

// // support only, requires cashing out user
// export const unlistItem = (key, storeId: string, itemId: string) =>
//   post<Store>(1, key, `/${storeId}/${itemId}/unlist`, {});

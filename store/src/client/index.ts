import fetch from '@honesty-store/service/src/fetch';
import { Transaction } from '@honesty-store/transaction/src/client';

export interface StoreItemDetails {
  name: string;
  qualifier?: string;
  genericName: string;
  genericNamePlural: string;
  unit: string;
  unitPlural: string;
  image: string;
  price: number;
}

export interface StoreItemListing extends StoreItemDetails {
  id: string;
  sellerId: string;
  listCount: number;
}

export interface StoreItemListed {
  id: string;
  type: 'store-list';
  storeId: string;
  listing: StoreItemListing;
}

export interface StoreItemUnlisted {
  id: string;
  type: 'store-unlist';
  storeId: string;
  itemId: string;
}

export interface StoreItemAudited {
  id: string;
  type: 'store-audit';
  storeId: string;
  itemId: string;
  userId: string;
  count: number;
}

export interface StoreItemPriceChanged {
  id: string;
  type: 'store-price-change';
  storeId: string;
  itemId: string;
  price: number;
}

export type StoreItemEvent = StoreItemAudited | StoreItemPriceChanged;

export type StoreEvent = StoreItemEvent | StoreItemListed | StoreItemUnlisted;

interface StoreItemTracking {
  purchaseCount: number;
  refundCount: number;
  availableCount: number;
}

export type StoreItem = StoreItemListing & StoreItemTracking;

export interface Store {
  id: string;
  version: number;
  code: string;
  agentId: string;
  items: StoreItem[];
}

import { lambdaBaseUrl } from '@honesty-store/service/src/baseUrl';

const { get, post } = fetch('store', lambdaBaseUrl);

export const getStoreFromCode = (key, code: string) =>
  get<Store>(1, key, `/code/${code}`);

export const getStoreFromId = (key, id: string) =>
  get<Store>(1, key, `/${id}`);

export const recordTransaction = (key, transaction: Transaction) =>
  post<Store>(1, key, `/transaction`, transaction);

export const listItem = (key, storeId: string, listing: StoreItemListing) =>
  post<Store>(1, key, `/${storeId}/item`, listing);

export const updateItemDetails = (key, storeId: string, itemId: string, details: StoreItemDetails) =>
  post<Store>(1, key, `/${storeId}/${itemId}`, details);

export const updateItemCount = (key, storeId: string, itemId: string, count: number, userId: string) =>
  post<Store>(1, key, `/${storeId}/${itemId}/count`, { count, userId });

export const unlistItem = (key, storeId: string, itemId: string) =>
  post<Store>(1, key, `/${storeId}/${itemId}/unlist`, {});

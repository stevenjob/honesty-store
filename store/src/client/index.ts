import fetch from '@honesty-store/service/lib/fetch';
import { Transaction } from '@honesty-store/transaction';

export interface StoreItemDetails {
  name: string;
  qualifier?: string;
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

export interface StoreItemDetailsChanged {
  id: string;
  type: 'store-details-change';
  storeId: string;
  itemId: string;
  price: number;
  name: string;
  qualifier?: string;
  image: string;
}

export type StoreItemEvent = StoreItemAudited | StoreItemDetailsChanged;

export type StoreEvent = StoreItemEvent | StoreItemListed | StoreItemUnlisted;

export interface StoreItemTracking {
  purchaseCount: number;
  refundCount: number;
  availableCount: number;
  revenue: number;
}

export type StoreItem = StoreItemListing & StoreItemTracking;

export interface StoreRevenue {
  startInclusive: number;
  endExclusive: number;
  total: number;
  seller: {
    [sellerId: string]: number;
  };
}

export interface Store {
  id: string;
  version: number;
  code: string;
  agentId: string;
  items: StoreItem[];
  revenue: StoreRevenue[];
}

import { lambdaBaseUrl } from '@honesty-store/service/lib/baseUrl';

export const calculateServiceFee = (price: number): number =>
  Math.ceil(price / 1.1 * 0.1);

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

import { lambdaBaseUrl } from '@honesty-store/service/lib/baseUrl';
import fetch from '@honesty-store/service/lib/fetch';

export interface ItemDetails {
  name: string;
  qualifier?: string;
  image: string;
  notes?: string;
}

export interface Item extends ItemDetails {
  id: string;
}

export interface ItemAliases {
  [key: string]: string;
}

const { get, post } = fetch('item', lambdaBaseUrl);

export const createItem = (key, details: ItemDetails) =>
  post(1, key, `/`, details);

export const updateItem = (key, itemId: string, details: ItemDetails) =>
  post(1, key, `/${itemId}`, details);

export const getItem = (key, itemId: string) =>
  get<Item>(1, key, `/${itemId}`);

export const getAllItems = key =>
  get<Item[]>(1, key, `/all`);

export const getItemAliases = key =>
  get<ItemAliases>(1, key, `/all/aliases`);

export const assertItemExistsAsync = (key, itemId: string) =>
  getItem(key, itemId)
    .then(() => void 0)
    .catch(e => {
      console.error(`item '${itemId}' doesn't exist`, e);
      process.exit(1);
    });

import { lambdaBaseUrl } from '@honesty-store/service/lib/baseUrl';
import fetch from '@honesty-store/service/lib/fetch';

export interface ItemDetails {
  name: string;
  qualifier?: string;
  genericName: string;
  genericNamePlural: string;
  unit: string;
  unitPlural: string;
  location?: string;
  image: string;
  weight?: number;
  notes?: string;
}

export interface Item extends ItemDetails {
  id: string;
}

const { get, post } = fetch('item', lambdaBaseUrl);

export const updateItem = (key, itemId: string, details: ItemDetails) =>
  post(1, key, `/${itemId}`, details);

export const getItem = (key, itemId: string) =>
  get<Item>(1, key, `/${itemId}`);

export const getAllItems = (key) =>
  get<Item[]>(1, key, `/all`);

export const assertItemExistsAsync = (key, itemId: string) =>
  getItem(key, itemId)
    .then(() => void 0)
    .catch(e => {
      console.error(`item '${itemId}' doesn't exist`, e);
      process.exit(1);
    });

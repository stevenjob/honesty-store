import fetch from '../../../service/src/fetch';

export interface Item {
  id: string;
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

const { get } = fetch('item', 'LAMBDA_BASE_URL');

export const getItem = (key, itemId: string) =>
  get<Item>(1, key, `/${itemId}`);

export const getAllItems = (key) =>
  get<Item[]>(1, key, `/all`);

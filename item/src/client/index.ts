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

const lambdaBaseUrl = process.env.LAMBDA_BASE_URL;
if (!lambdaBaseUrl) {
  throw new Error('no $LAMBDA_BASE_URL provided');
}

const { get } = fetch('item', lambdaBaseUrl);

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

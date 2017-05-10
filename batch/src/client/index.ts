import fetch from '../../../service/src/fetch';

import { MARKETPLACE_ID } from './constants';
export { MARKETPLACE_ID } from './constants';

export interface Batch {
  id: string;
  purchased?: number;
  quantity: number;
  supplier?: string;
  supplierCode?: string;
  itemId: string;
  itemQuantity: number;
  expiry?: number;
  priceExcludingVAT?: number;
  VATRate?: number;
}

import { lambdaBaseUrl } from '../../../service/src/baseUrl';

const { get } = fetch('batch', lambdaBaseUrl);

export const getBatch = (key, batchId: string) =>
  get<Batch>(1, key, `/${batchId}`);

export const itemCostFromBatch = ({ priceExcludingVAT, itemQuantity }: Batch) =>
  priceExcludingVAT / itemQuantity;

export const isMarketplaceBatch = ({ supplier }: Batch) =>
  supplier === MARKETPLACE_ID;
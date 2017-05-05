import fetch from '../../../service/src/fetch';

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

export const MARKETPLACE_ID = 'HS_MARKETPLACE';

const lambdaBaseUrl = process.env.LAMBDA_BASE_URL;
if (!lambdaBaseUrl) {
  throw new Error('no $LAMBDA_BASE_URL provided');
}

const { get } = fetch('batch', lambdaBaseUrl);

export const getBatch = (key, batchId: string) =>
  get<Batch>(1, key, `/${batchId}`);

export const itemCostFromBatch = ({ priceExcludingVAT, itemQuantity }: Batch) =>
  priceExcludingVAT / itemQuantity;

export const isMarketplaceBatch = ({ supplier }: Batch) =>
  supplier === MARKETPLACE_ID;

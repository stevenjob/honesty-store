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

const MARKETPLACE_ID = 'HS_MARKETPLACE';

const lambdaBaseUrl = process.env.LAMBDA_BASE_URL;
if (!lambdaBaseUrl) {
  throw new Error('no $LAMBDA_BASE_URL provided');
}

const { get } = fetch('batch', lambdaBaseUrl);

export const getBatch = (key, batchId: string) =>
  get<Batch>(1, key, `/${batchId}`);

export const getExpiry = async (key, batchId: string) => {
  const batch = await getBatch(key, batchId);
  return batch.expiry;
};

export const getItemCost = async (batchId: string) => {
  const { priceExcludingVAT, itemQuantity } = await getBatch(key, batchId);
  return priceExcludingVAT / itemQuantity;
};

export const getVATRate = (batchId: string): number => {
  const { VATRate } = await getBatch(key, batchId);
  return VATRate;
};

export const isMarketplaceBatch = (batchId: string): boolean => {
  const { supplier } = await getBatch(key, batchId);
  return supplier === MARKETPLACE_ID;
};

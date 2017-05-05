import { Batch, MARKETPLACE_ID } from '../';

export const getBatch = (_key, batchId: string) => ({
  id: batchId,
  quantity: 1,
  itemId: 'item',
  itemQuantity: 1,
  expiry: 0,
  VATRate: 0.2
});

export const itemCostFromBatch = ({ id }: Batch) => Number(id);

export const isMarketplaceBatch = ({ supplier }: Batch) =>
  supplier === MARKETPLACE_ID;

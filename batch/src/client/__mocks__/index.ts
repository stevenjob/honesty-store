import { MARKETPLACE_ID } from '../constants';
export { MARKETPLACE_ID } from '../constants';

export const getBatch = (_key, batchId: string) => ({
  id: batchId,
  quantity: 1,
  itemId: 'item',
  itemQuantity: 1,
  expiry: 0,
  VATRate: 0.2
});

export const itemCostFromBatch = ({ id }) => Number(id);

export const isMarketplaceBatch = ({ supplier }) =>
  supplier === MARKETPLACE_ID;

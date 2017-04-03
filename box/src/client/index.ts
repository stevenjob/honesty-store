import fetch from '../../../service/src/fetch';

export interface BatchReference {
  id: string;
  count: number;
}
export interface BoxItemWithBatchReference {
  itemID: string;
  batches: BatchReference[];
}
export interface FixedBoxItemOverheads {
  shippingCost: number;
  warehousingCost: number;
  packagingCost: number;
  packingCost: number;
  serviceFee: number;
}
export interface VariableBoxItemOverheads {
  creditCardFee: number;
  wholesaleCost: number;
  subtotal: number;
  VAT: number;
  donation: number;
  total: number;
}
interface Donatable {
  donationRate: number;
}
type ShippingDetails = {
  shippingCost: number;
  packed?: number;
  shipped?: number;
  received?: number;
  closed?: number;
}
export type BoxItem = BoxItemWithBatchReference & FixedBoxItemOverheads & VariableBoxItemOverheads & {
  count: number;
  depleted?: number;
};

export type ShippedBoxSubmission = ShippingDetails & Donatable & {
  boxItems: BoxItemWithBatchReference[];
};
export type MarketplaceBoxSubmission = Donatable & {
  boxItem: BoxItemWithBatchReference;
}
// this is duplicated in aws/src/table/table.ts
export type Box = ShippingDetails & Donatable & {
  boxItems: BoxItem[];
  count: number;
  storeId: string;
  version: number;
  id: string;
};

const { get, post } = fetch('box');

export const flagOutOfStock = ({ key, boxId, itemId, depleted }) =>
  post<{}>(1, key, `/out-of-stock/${boxId}/${itemId}/${depleted}`, {});

export const createShippedBox = (key, storeId: string, ShippedboxSubmission: ShippedBoxSubmission, dryRun) =>
  post<Box>(1, key, `/store/${storeId}/shipped?dryRun=${dryRun}`, ShippedboxSubmission);

export const createMarketplaceBox = (key, storeId: string, submission: MarketplaceBoxSubmission, dryRun: boolean) =>
  post<Box>(1, key, `/store/${storeId}/marketplace?dryRun=${dryRun}`, submission);

export const getBoxesForStore = (key, storeId) =>
  get<Box[]>(1, key, `/store/${storeId}`);

export const getBox = (key, boxId: string) =>
  get<Box>(1, key, `/${boxId}`);

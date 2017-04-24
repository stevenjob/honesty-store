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
};
export type BoxItem = BoxItemWithBatchReference & FixedBoxItemOverheads & VariableBoxItemOverheads & {
  count: number;
  depleted?: number;
  expiry: number;
};

export type ShippedBoxSubmission = ShippingDetails & Donatable & {
  boxItems: BoxItemWithBatchReference[];
};
export type MarketplaceBoxSubmission = Donatable & {
  boxItem: BoxItemWithBatchReference;
};
// this is duplicated in aws/src/table/table.ts
export type Box = ShippingDetails & Donatable & {
  boxItems: BoxItem[];
  count: number;
  storeId: string;
  version: number;
  id: string;
};

const { get, post, put } = fetch('box');

export const flagOutOfStock = ({ key, boxId, itemId, depleted }) =>
  post<{}>(1, key, `/${boxId}/out-of-stock/${itemId}/${depleted}`, {});

export const markBoxAsReceived = (key, boxId: string) =>
  post<{}>(1, key, `/${boxId}/received`, {});

export const markBoxAsShipped = (key, boxId: string, date: number) =>
  put<{}>(1, key, `/${boxId}/shipped/${date}`, {});

export const createShippedBox = (key, storeId: string, submission: ShippedBoxSubmission, dryRun) =>
  post<Box>(1, key, `/store/${storeId}/shipped?dryRun=${dryRun}`, submission);

export const createMarketplaceBox = (key, storeId: string, submission: MarketplaceBoxSubmission, dryRun: boolean) =>
  post<Box>(1, key, `/store/${storeId}/marketplace?dryRun=${dryRun}`, submission);

export const getBoxesForStore = async (key, storeId: string, filter: (box: Box) => boolean) => {
  const boxes = await get<Box[]>(1, key, `/store/${storeId}`);
  return boxes.filter(filter);
};

export const getBox = (key, boxId: string) =>
  get<Box>(1, key, `/${boxId}`);

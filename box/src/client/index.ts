import fetch from '../../../service/src/fetch';

export interface BatchReference {
  id: string;
  count: number;
}

interface Counted {
  count: number;
  depleted?: number;
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
  total: number;
}
interface BoxShippingDetails {
  shippingCost: number;
  packed?: number;
  shipped?: number;
  received?: number;
  closed?: number;
}

export type BoxItem = BoxItemWithBatchReference & Counted & FixedBoxItemOverheads & VariableBoxItemOverheads;

export type BoxSubmission = BoxShippingDetails & {
  boxItems: BoxItemWithBatchReference[];
};

// this is duplicated in aws/src/table/table.ts
export type Box = BoxShippingDetails & {
  boxItems: BoxItem[];
  count: number;
  storeId: string;
  version: number;
  id: string;
};

const { get, post } = fetch('box');

export const flagOutOfStock = ({ key, boxId, itemId, depleted }) =>
  post<{}>(1, key, `/out-of-stock/${boxId}/${itemId}/${depleted}`, {});

export const createBox = (key, storeId: string, boxSubmission: BoxSubmission) =>
  post<Box>(1, key, `/store/${storeId}`, boxSubmission);

export const getBoxesForStore = (key, storeId) =>
  get<Box[]>(1, key, `/store/${storeId}`);

export const getBox = (key, boxId: string) =>
  get<Box>(1, key, `/${boxId}`);

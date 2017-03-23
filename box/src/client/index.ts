import fetch from '../../../service/src/fetch';

export interface BatchReference {
  id: string;
  count: number;
}

interface Counted {
  count: number;
  depleted?: number;
}
interface Versioned {
  version: number;
}
interface Identified {
  id: string;
}
interface StoreAssociated {
  storeId: string;
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
interface VariableBoxItemOverheads {
  creditCardFee: number;
  wholesaleCost: number;
  subtotal: number;
  VAT: number;
  total: number;
}
interface BoxShippingDetails {
  storeId: string;
  shippingCost: number;
  packed?: number;
  shipped?: number;
  received?: number;
  closed?: number;
}

export type BoxItem = BoxItemWithBatchReference & Counted & FixedBoxItemOverheads & VariableBoxItemOverheads;

export type BoxSubmission = BoxShippingDetails & { boxItems: BoxItemWithBatchReference[]; } & StoreAssociated;

// this is duplicated in aws/src/table/table.ts
export type Box = BoxShippingDetails & Versioned & Identified & { boxItems: BoxItem[]; } & { count: number; } & StoreAssociated;

const { get, post } = fetch('box');

export const getBox = (key, boxId: string) =>
  get<Box>(1, key, `/${boxId}`);

export const flagOutOfStock = ({ key, boxId, itemId }) =>
  post<{}>(1, key, `/out-of-stock/${boxId}/${itemId}`, {});

export const createBox = (key, boxSubmission: BoxSubmission) =>
  post<Box>(1, key, `/`, boxSubmission);

export const getBoxesForStore = (key, storeId) =>
  get<Box[]>(1, key, `/store/${storeId}`);

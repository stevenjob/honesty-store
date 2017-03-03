import fetch from '../../../service/src/fetch';

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
interface BoxItemWithBatchReference {
  itemID: string;
  batches: {
    id: string;
    count: number;
  }[];
}
interface BoxItemOverheads {
  shippingCost: number;
  warehousingCost: number;
  packagingCost: number;
  packingCost: number;
  serviceFee: number;
  creditCardFee: number;
}
interface BoxShippingDetails {
  shippingCost: number;
  packed?: yyyymmdd;
  shipped?: yyyymmdd;
  received?: yyyymmdd;
  closed?: yyyymmdd;
}

type BoxItem = BoxItemWithBatchReference & Counted & BoxItemOverheads;

type yyyymmdd = string;

export type BoxSubmission = BoxShippingDetails & { boxItems: BoxItemWithBatchReference[]; };

// this is duplicated in aws/src/table/table.ts
export type Box = BoxShippingDetails & Versioned & Identified & { boxItems: BoxItem[]; };

const { get, post } = fetch('box');

export const getBox = (key, boxId: string) =>
  get<Box>(1, key, `/${boxId}`);

export const flagOutOfStock = ({ key, boxId, itemId }) =>
  post<{}>(1, key, `/out-of-stock/${boxId}/${itemId}`, {});

export const createBox = (key, boxSubmission: BoxSubmission) =>
  post<Box>(1, key, `/`, boxSubmission);

import fetch from '../../../service/src/fetch';

interface BoxItem {
  itemID: string;
  count: number;
  depleted: boolean;
}

type yyyymmdd = string;

export interface Box {
  id: string;
  version: number;
  boxItems: BoxItem[];
  packed: yyyymmdd;
  shipped: yyyymmdd;
  received: yyyymmdd;
  closed?: yyyymmdd;
}

const { get, post } = fetch('box');

export const getBox = (key, boxId: string) =>
  get<Box>(1, key, `/${boxId}`);

export const flagOutOfStock = ({ key, boxId, itemId }) =>
  post<{}>(1, key, `/out-of-stock/${boxId}/${itemId}`, {});

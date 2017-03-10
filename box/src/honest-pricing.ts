import { v4 as uuid } from 'uuid';
import { getItemCost as getBatchItemCost, getVATRate } from './batch';
import {
  BatchReference, Box, BoxItem,
  BoxItemWithBatchReference, BoxSubmission, FixedBoxItemOverheads
} from './client';

const creditCardFeeRate = 0.054;
const expectedLossPerBox = 0.05;

const warehousingCostPerBox = 50;
const packagingCostPerBox = 300;
const packingCostPerBox = 200;
const feePerBox = 0;

const sum = <T>(items: T[], projection: (item: T) => number) =>
  items.map(projection)
    .reduce((a, b) => a + b, 0);

const avg = <T>(items: T[], projection: (item: T) => { count: number, value: number }) => {
  const { totalValue, totalCount } = items.map(projection)
    .reduce(
      (
        { totalCount, totalValue },
        { count, value }
      ) => ({
        totalCount: totalCount + count,
        totalValue: totalValue + value * count
      }),
      {
        totalValue: 0,
        totalCount: 0
      }
    );
  return totalValue / totalCount;
};

export const sumBatches = (batches: BatchReference[]) =>
  sum(batches, ({ count }) => count);

export const sumBoxItems = (boxItems: BoxItemWithBatchReference[]) =>
  sum(boxItems, ({ batches }) => sumBatches(batches));

export const getItemCost = (batches: BatchReference[]) =>
  avg(
    batches,
    ({ id, count }) => ({
      value: getBatchItemCost(id),
      count
    })
  );

export const getAverageItemCost = (boxItems): number =>
  avg(
    boxItems,
    ({ batches }) => ({
      value: getItemCost(batches),
      count: sumBatches(batches)
    })
  );

const getPricedBoxItem = (boxItemWithBatchRef: BoxItemWithBatchReference, fixedOverheads: FixedBoxItemOverheads): BoxItem => {
  const { batches } = boxItemWithBatchRef;

  const { shippingCost, warehousingCost, packagingCost, packingCost, serviceFee } = fixedOverheads;
  const subtotal = getItemCost(batches) + shippingCost + warehousingCost + packagingCost + packingCost
    + serviceFee;

  const rate = getVATRate(batches[0].id);
  const total = subtotal / (1 - creditCardFeeRate - rate);
  const VAT = total * rate;
  const creditCardFee = total * creditCardFeeRate;

  return {
    count: sumBatches(batches),
    depleted: false,
    subtotal,
    creditCardFee,
    VAT,
    total,
    ...fixedOverheads,
    ...boxItemWithBatchRef
  };
};

export default (boxSubmission: BoxSubmission): Box => {
  const { boxItems, ...rest } = boxSubmission;
  const { shippingCost } = rest;

  const totalItems = sumBoxItems(boxItems);
  const expectedLossQuantity = Math.ceil(totalItems * expectedLossPerBox);
  const expectedBoxQuantity = totalItems - expectedLossQuantity;

  const convertBoxCostToPerItem = (cost: number) => cost / expectedBoxQuantity;

  const averageItemCost = getAverageItemCost(boxItems);
  const shrinkagePerBox = averageItemCost * expectedLossQuantity;

  const fixedOverheads: FixedBoxItemOverheads = {
    shippingCost: convertBoxCostToPerItem(shippingCost),
    packingCost: convertBoxCostToPerItem(packingCostPerBox),
    packagingCost: convertBoxCostToPerItem(packagingCostPerBox),
    warehousingCost: convertBoxCostToPerItem(warehousingCostPerBox),
    serviceFee: convertBoxCostToPerItem(feePerBox) + convertBoxCostToPerItem(shrinkagePerBox)
  };

  const pricedBoxItems = boxItems.map((el) => getPricedBoxItem(el, fixedOverheads));

  return {
    id: uuid(),
    count: totalItems,
    version: 0,
    boxItems: pricedBoxItems,
    ...rest
  };
};

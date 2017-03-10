import { v4 as uuid } from 'uuid';
import { getItemCostInBatchExcludingVAT, getVAT } from './batch';
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

export const getWholesaleItemCostExcludingVAT = (batches: BatchReference[]) =>
  avg(
    batches,
    ({ id, count }) => ({
      value: getItemCostInBatchExcludingVAT(id),
      count
    })
  );

export const getAverageItemCost = (boxItems): number =>
  avg(
    boxItems,
    ({ batches }) => ({
      value: getWholesaleItemCostExcludingVAT(batches),
      count: sumBatches(batches)
    })
  );

const getPricedBoxItem = (boxItemWithBatchRef: BoxItemWithBatchReference, fixedOverheads: FixedBoxItemOverheads): BoxItem => {
  const { batches } = boxItemWithBatchRef;

  const { shippingCost, warehousingCost, packagingCost, packingCost, serviceFee } = fixedOverheads;
  const subtotal = getWholesaleItemCostExcludingVAT(batches) + shippingCost + warehousingCost + packagingCost + packingCost
    + serviceFee;

  const rateOfVAT = getVAT(batches[0].id);
  const finalTotal = subtotal / (1 - creditCardFeeRate - rateOfVAT);
  const VAT = finalTotal * rateOfVAT;
  const creditCardFee = finalTotal * creditCardFeeRate;

  return {
    count: sumBatches(batches),
    depleted: false,
    subtotal,
    creditCardFee,
    VAT,
    finalTotal,
    ...fixedOverheads,
    ...boxItemWithBatchRef
  };
};

export const getHonestPricing = (boxSubmission: BoxSubmission): Box => {
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

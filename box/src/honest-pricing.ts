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

export const sumBatches = (batches: BatchReference[]) =>
  batches.map(({ count }) => count)
    .reduce(((itemCount, batchCount) => batchCount + itemCount), 0);

export const sumBoxItems = (boxItems: BoxItemWithBatchReference[]) =>
  boxItems.map(({ batches }) => sumBatches(batches))
    .reduce(((totalItems, itemCount) => totalItems + itemCount), 0);

export const getWholesaleItemCostExcludingVAT = (batches: BatchReference[]) => {
  const { totalPrice, totalCount } = batches.map(
      ({ id, count }) =>
        ({
          price: getItemCostInBatchExcludingVAT(id),
          count
        })
    )
    .reduce(
      ({ totalPrice, totalCount }, { price, count }) =>
        ({
          totalCount: totalCount + count,
          totalPrice: totalPrice + count * price
        }),
      { totalPrice: 0, totalCount: 0 }
    );
  return totalPrice / totalCount;
};

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

export const getAverageItemCost = (boxItems): number => {
  let totalItemCost = 0;
  for (const boxItem of boxItems) {
    const { batches } = boxItem;
    const boxQty = sumBatches(batches);
    const boxCostExcVAT = getWholesaleItemCostExcludingVAT(batches);
    totalItemCost += (boxQty * boxCostExcVAT);
  }
  return totalItemCost / sumBoxItems(boxItems);
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

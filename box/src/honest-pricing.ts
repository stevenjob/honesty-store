import { v4 as uuid } from 'uuid';
import { getItemCostInBatchExcludingVAT, getVAT } from './batch';
import {
  BatchReference, Box, BoxItem,
  BoxItemWithBatchReference, BoxSubmission, FixedBoxItemOverheads
} from './client';

// Constants
const creditCardFee = 0.054;
const expectedLossPerBox = 0.05;

const warehousingCostPerBox = 50;
const packagingCostPerBox = 300;
const packingCostPerBox = 200;
const feePerBox = 0;
// shippingCost comes from box, as can vary

export const sumBatches = (batches: BatchReference[]) =>
  batches.map(({ count }) => count)
    .reduce(((itemCount, batchCount) => batchCount + itemCount), 0);

export const sumBoxItems = (boxItems: BoxItemWithBatchReference[]) =>
  boxItems.map(({ batches }) => sumBatches(batches))
    .reduce(((totalItems, itemCount) => totalItems + itemCount), 0);

// Probably want to average these out based on quantities in batch
export const getWholesaleItemCostExcludingVAT = (batches: BatchReference[]) => {
  const totalPrice = batches.map((el) => getItemCostInBatchExcludingVAT(el.id))
    .reduce(((runningTotal, price) => runningTotal + price), 0);
  return totalPrice / batches.length;
};

const getPricedBoxItem = (boxItemWithBatchRef: BoxItemWithBatchReference, fixedOverheads: FixedBoxItemOverheads): BoxItem => {
  // Calculate item VAT here
  const { batches } = boxItemWithBatchRef;

  if (batches.length > 1) {
    console.warn('We don\'t deal with multiple batches of different prices very well at the moment!');
  }

  const { shippingCost, warehousingCost, packagingCost, packingCost, serviceFee } = fixedOverheads;
  const itemVATRate = getVAT(batches[0].id); // TODO: this may not be safe if VAT rate changes between batches... how likely though?
  const itemSubtotal = getWholesaleItemCostExcludingVAT(batches) + shippingCost + warehousingCost + packagingCost + packingCost
    + serviceFee;
  const itemPrice = itemSubtotal / (1 - creditCardFee - itemVATRate);
  const itemVAT = itemPrice * itemVATRate;

  const itemCreditCardFee = itemPrice * creditCardFee;

  return {
    count: sumBatches(batches),
    depleted: false,
    itemPrice,
    creditCardFee: itemCreditCardFee,
    itemVAT,
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

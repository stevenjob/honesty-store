import { v4 as uuid } from 'uuid';
import { getBatch, getItemCost as getBatchItemCost, getVATRate } from './batch';
import {
  BatchReference, Box, BoxItem,
  BoxItemWithBatchReference, FixedBoxItemOverheads, ShippedBoxSubmission,
  VariableBoxItemOverheads
} from './client';
import { avg, roundItemCosts, sum } from './math';

const creditCardFeeRate = 0.054;
const expectedLossPerBox = 0.05;

const warehousingCostPerBox = 50;
const packagingCostPerBox = 300;
const packingCostPerBox = 200;
const feePerBox = 0;

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

const getPricedBoxItem = (
  boxItemWithBatchRef: BoxItemWithBatchReference,
  fixedOverheads: FixedBoxItemOverheads,
  donationRate: number
): BoxItem => {
  const { batches } = boxItemWithBatchRef;

  const { shippingCost, warehousingCost, packagingCost, packingCost, serviceFee } = fixedOverheads;
  const wholesaleCost = getItemCost(batches);
  const subtotal = wholesaleCost + shippingCost + warehousingCost + packagingCost + packingCost
    + serviceFee;

  const rate = getVATRate(batches[0].id);
  const totalExclDonation = subtotal / (1 - creditCardFeeRate - rate);
  const VAT = totalExclDonation * rate;
  const creditCardFee = totalExclDonation * creditCardFeeRate;

  const donation = totalExclDonation * donationRate;
  const total = totalExclDonation + donation;

  const variableCosts: VariableBoxItemOverheads = {
    wholesaleCost,
    subtotal,
    creditCardFee,
    VAT,
    donation,
    total
  };

  const roundedCosts = roundItemCosts({ ...fixedOverheads, ...variableCosts });

  const { expiry } = batches.map(({ id }) => getBatch(id))
    .sort((a, b) => {
      return a.expiry - b.expiry;
    })[0];

  return {
    count: sumBatches(batches),
    expiry,
    ...roundedCosts,
    ...boxItemWithBatchRef
  };
};

export default (storeId: string, boxSubmission: ShippedBoxSubmission): Box & { version: 0 } => {
  const { boxItems, ...rest } = boxSubmission;
  const { shippingCost, donationRate } = rest;

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

  const pricedBoxItems = boxItems.map((el) => getPricedBoxItem(el, fixedOverheads, donationRate));

  return {
    id: uuid(),
    storeId,
    count: totalItems,
    version: 0,
    boxItems: pricedBoxItems,
    ...rest
  };
};

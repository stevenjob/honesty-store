import { v4 as uuid } from 'uuid';
import { getExpiry, getItemCost as getBatchItemCost, getVATRate } from '../../batch/src/client';
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

export const getItemCost = async (key, batches: BatchReference[]) => {
  const batchItemCosts = new Map<string, number>();

  await Promise.all(
    batches.map(async ({ id }) =>
      batchItemCosts.set(id, await getBatchItemCost(key, id))));

  return avg(
    batches,
    ({ id, count }) => ({
      value: batchItemCosts.get(id),
      count
    })
  );
};

export const getAverageItemCost = async (key, boxItems: BoxItemWithBatchReference[]) => {
  const costs = new Map<string, number>();

  await Promise.all(
    boxItems.map(async ({ itemID, batches }) =>
      costs.set(itemID, await getItemCost(key, batches))));

  return avg(
    boxItems,
    ({ itemID, batches }) => ({
      value: costs.get(itemID),
      count: sumBatches(batches)
    })
  );
};

const getPricedBoxItem = async (
  key,
  boxItemWithBatchRef: BoxItemWithBatchReference,
  fixedOverheads: FixedBoxItemOverheads,
  donationRate: number
): Promise<BoxItem> => {
  const { batches } = boxItemWithBatchRef;

  const { shippingCost, warehousingCost, packagingCost, packingCost, serviceFee } = fixedOverheads;
  const wholesaleCost = await getItemCost(key, batches);
  const subtotal = wholesaleCost + shippingCost + warehousingCost + packagingCost + packingCost
    + serviceFee;

  const rate = await getVATRate(key, batches[0].id);
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

  const expiries = await Promise.all(batches.map(({ id }) => getExpiry(key, id)));

  const presentExpiries = expiries.filter(el => el != null);

  return {
    count: sumBatches(batches),
    expiry: presentExpiries.length === 0 ? null : presentExpiries.reduce((a, b) => Math.min(a, b)),
    ...roundedCosts,
    ...boxItemWithBatchRef
  };
};

export default async (key, storeId: string, boxSubmission: ShippedBoxSubmission): Promise<Box & { version: 0 }> => {
  const { boxItems, ...rest } = boxSubmission;
  const { shippingCost, donationRate } = rest;

  const totalItems = sumBoxItems(boxItems);
  const expectedLossQuantity = Math.ceil(totalItems * expectedLossPerBox);
  const expectedBoxQuantity = totalItems - expectedLossQuantity;

  const convertBoxCostToPerItem = (cost: number) => cost / expectedBoxQuantity;

  const averageItemCost = await getAverageItemCost(key, boxItems);
  const shrinkagePerBox = averageItemCost * expectedLossQuantity;

  const fixedOverheads: FixedBoxItemOverheads = {
    shippingCost: convertBoxCostToPerItem(shippingCost),
    packingCost: convertBoxCostToPerItem(packingCostPerBox),
    packagingCost: convertBoxCostToPerItem(packagingCostPerBox),
    warehousingCost: convertBoxCostToPerItem(warehousingCostPerBox),
    serviceFee: convertBoxCostToPerItem(feePerBox) + convertBoxCostToPerItem(shrinkagePerBox)
  };

  const pricedBoxItems = await Promise.all(boxItems.map((el) => getPricedBoxItem(key, el, fixedOverheads, donationRate)));

  return {
    id: uuid(),
    storeId,
    count: totalItems,
    version: 0,
    boxItems: pricedBoxItems,
    ...rest
  };
};

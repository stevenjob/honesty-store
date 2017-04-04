import { v4 as uuid } from 'uuid';
import { getItemCost } from './batch';
import { Box, BoxItem, FixedBoxItemOverheads, MarketplaceBoxSubmission, VariableBoxItemOverheads } from './client';
import { roundItemCosts } from './math';

export default (storeId: string, submission: MarketplaceBoxSubmission): Box & { version: 0 } => {
  const { donationRate, boxItem: batchReference } = submission;
  const { batches } = batchReference;

  const { id, count } = batches[0];

  const wholesaleCost = getItemCost(id);
  const serviceFee = wholesaleCost * 0.1;
  const subtotal = wholesaleCost + serviceFee;
  const donation = subtotal * donationRate;
  const total = subtotal + donation;

  const variableCosts: VariableBoxItemOverheads = {
    wholesaleCost,
    subtotal,
    donation,
    total,
    creditCardFee: 0,
    VAT: 0
  }

  const fixedOverheads: FixedBoxItemOverheads = {
    shippingCost: 0,
    warehousingCost: 0,
    packagingCost: 0,
    packingCost: 0,
    serviceFee
  }

  const roundedCosts = roundItemCosts({ ...fixedOverheads, ...variableCosts });

  const boxItem: BoxItem = {
    ...batchReference,
    ...roundedCosts,
    count
  }

  return {
    id: uuid(),
    donationRate,
    storeId,
    count: count,
    boxItems: [boxItem],
    version: 0,
    shippingCost: 0
  };
}
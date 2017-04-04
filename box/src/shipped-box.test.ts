jest.mock('./batch');

import { expect } from 'chai';
import { ShippedBoxSubmission } from './client';
import calculateShippedBoxPricing, { getAverageItemCost, getItemCost } from './shipped-box';

const precision = 0.5;

const storeId = 'test';

const boxSubmission: ShippedBoxSubmission = {
  shippingCost: 300,
  donationRate: 0.1,
  boxItems: [
    {
      itemID: 'item-a',
      batches: [
        { id: '30', count: 2 },
        { id: '37.125', count: 1 }
      ]
    },
    {
      itemID: 'item-b',
      batches: [
        { id: '37.333333333333336', count: 5 }
      ]
    }
  ]
};

describe('Average Cost', () => {
  it('should calculate the average item cost across the batches', () => {
    const { boxItems } = boxSubmission;
    const averageItemCost = getAverageItemCost(boxItems);
    expect(averageItemCost).to.be.approximately(35, precision);
  });
});

describe('Wholesale item cost', () => {
  it('should determine the wholesale value of item-a', () => {
    const { boxItems } = boxSubmission;
    const batches = boxItems[0].batches;
    const wholesaleItemCost = getItemCost(batches);
    expect(wholesaleItemCost).to.be.approximately(32, precision);
  });

  it('should determine the wholesale value of item b', () => {
    const { boxItems } = boxSubmission;
    const batches = boxItems[1].batches;
    const wholesaleItemCost = getItemCost(batches);
    expect(wholesaleItemCost).to.be.approximately(37, precision);
  });
});

describe('Box Submission', () => {
  it('should calculate box item costs', () => {
    const { boxItems } = calculateShippedBoxPricing(storeId, boxSubmission);

    const {
      wholesaleCost,
      warehousingCost,
      packagingCost,
      packingCost,
      shippingCost,
      serviceFee,
      creditCardFee,
      subtotal,
      VAT,
      donation,
      total
    } = boxItems[0];

    expect(wholesaleCost).to.equal(32, 'Incorrect wholesale cost');
    expect(warehousingCost).to.equal(7, 'Incorrect warehousing cost');
    expect(packagingCost).to.equal(43, 'Incorrect packaging cost');
    expect(packingCost).to.equal(29, 'Incorrect packing cost');
    expect(shippingCost).to.equal(43, 'Incorrect shipping cost');
    expect(serviceFee).to.equal(4, 'Incorrect service fee');

    expect(subtotal).to.equal(159, 'Incorrect subtotal');
    expect(creditCardFee).to.equal(12, 'Incorrect credit card fee');
    expect(VAT).to.equal(43, 'Incorrect item VAT');
    expect(donation).to.equal(21, 'Incorrect donation');
    expect(total).to.equal(234, 'Incorrect item price');
  });

  it('should calculate total items in box', () => {
    const { count } = calculateShippedBoxPricing(storeId, boxSubmission);
    expect(count).to.equal(8);
  });

  it('should calculate total of individual box items', () => {
    const { boxItems } = calculateShippedBoxPricing(storeId, boxSubmission);
    const { count: boxItem0Count } = boxItems[0];
    const { count: boxItem1Count } = boxItems[1];
    expect(boxItem0Count).to.equal(3);
    expect(boxItem1Count).to.equal(5);
  });

  it('should assign storeId to box', () => {
    const { storeId: boxStoreId } = calculateShippedBoxPricing(storeId, boxSubmission);
    expect(boxStoreId).to.equal(storeId);
  });
});

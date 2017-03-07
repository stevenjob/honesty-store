import { expect } from 'chai';
import { BoxSubmission } from '../client';
import { getAverageItemCost, getHonestPricing, getWholesaleItemCostExcludingVAT } from '../honest-pricing';

const boxSubmission: BoxSubmission = {
  shippingCost: 300,
  boxItems: [
    {
      itemID: 'edef6848-f3d5-4733-babc-bc10bc3d257c', // popchips s&v
      batches: [
        { id: '6841c840-301b-4d41-b791-82135f287186', count: 3 }
      ]
    },
    {
      itemID: '64e177af-6313-4d9e-b39a-8495c2f1d939', // love corn
      batches: [
        { id: '6c2c6571-3b83-490c-b69a-7462e478a5b9', count: 5 }
      ]
    }
  ]
};

describe('Average Cost', () => {
  it('should calcualate the average item cost in the two batches', () => {
    const { boxItems } = boxSubmission;
    const averageItemCost = getAverageItemCost(boxItems);
    expect(Math.round(averageItemCost)).to.equal(35);
  });
});

describe('Wholesale item cost', () => {
  it('should determine the wholesale value of Popchips', () => {
    const { boxItems } = boxSubmission;
    const batches = boxItems[0].batches;
    const wholesaleItemCost = getWholesaleItemCostExcludingVAT(batches);
    expect(Math.round(wholesaleItemCost)).to.equal(32);
  });

  it('should determine the wholesale value of Love Corn', () => {
    const { boxItems } = boxSubmission;
    const batches = boxItems[1].batches;
    const wholesaleItemCost = getWholesaleItemCostExcludingVAT(batches);
    expect(Math.round(wholesaleItemCost)).to.equal(37);
  });
});

describe('Box Submission', () => {
  it('should calculate box item costs', () => {
    const { boxItems } = getHonestPricing(boxSubmission);

    const {
      warehousingCost,
      packagingCost,
      packingCost,
      shippingCost,
      serviceFee,
      creditCardFee,
      subtotal,
      VAT,
      finalTotal
    } = boxItems[0];

    expect(Math.round(warehousingCost)).to.equal(7, 'Incorrect warehousing cost');
    expect(Math.round(packagingCost)).to.equal(43, 'Incorrect packaging cost');
    expect(Math.round(packingCost)).to.equal(29, 'Incorrect packing cost');
    expect(Math.round(shippingCost)).to.equal(43, 'Incorrect shipping cost');
    expect(Math.round(serviceFee)).to.equal(5, 'Incorrect service fee');

    expect(Math.round(subtotal)).to.equal(159, 'Incorrect subtotal');
    expect(Math.round(creditCardFee)).to.equal(12, 'Incorrect credit card fee');
    expect(Math.round(VAT)).to.equal(43, 'Incorrect item VAT');
    expect(Math.round(finalTotal)).to.equal(213, 'Incorrect item price');
  });

  it('should calculate total items in box', () => {
    const { count } = getHonestPricing(boxSubmission);
    expect(count).to.equal(8);
  });

  it('should calculate total of individual box items', () => {
    const { boxItems } = getHonestPricing(boxSubmission);
    const { count: boxItem0Count } = boxItems[0];
    const { count: boxItem1Count } = boxItems[1];
    expect(boxItem0Count).to.equal(3);
    expect(boxItem1Count).to.equal(5);
  });
});

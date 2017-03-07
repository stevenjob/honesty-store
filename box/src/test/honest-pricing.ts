import { expect } from 'chai';
import { BoxItemWithBatchReference } from '../client';
import { getAverageItemCost, getWholesaleItemCostExcludingVAT } from '../honest-pricing';

const boxItems: BoxItemWithBatchReference[] = [
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
];

describe('Average Cost', () => {
  it('should calcualate the average item cost in the two batches', () => {
    const averageItemCost = getAverageItemCost(boxItems);
    expect(Math.round(averageItemCost)).to.equal(35);
  });
});

describe('Wholesale item cost', () => {
  it('should determine the wholesale value of Popchips', () => {
    const batches = boxItems[0].batches;
    const wholesaleItemCost = getWholesaleItemCostExcludingVAT(batches);
    expect(Math.round(wholesaleItemCost)).to.equal(32);
  });
  it('should determine the wholesale value of Love Corn', () => {
    const batches = boxItems[1].batches;
    const wholesaleItemCost = getWholesaleItemCostExcludingVAT(batches);
    expect(Math.round(wholesaleItemCost)).to.equal(37);
  });
});

  });
});

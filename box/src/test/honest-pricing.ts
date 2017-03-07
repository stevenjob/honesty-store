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
    itemID: '8fd928e0-06c9-4958-9259-719dc451a8c2', // popchips s&v
    batches: [
      { id: '9064a75f-5200-4d95-8889-da67aa6041d5', count: 3 }
    ]
  }
]

describe('Wholesale item cost', () => {
  it('should determine the wholesale value of the item', () => {
    const batches = boxItems[0].batches;
    const wholesaleItemCost = getWholesaleItemCostExcludingVAT(batches);
    expect(wholesaleItemCost).to.equal(33);
  });
});

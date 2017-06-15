jest.mock('@honesty-store/batch');

import { expect } from 'chai';
import { MarketplaceBoxSubmission } from './client';
import calculateMarketplaceBoxPricing from './marketplace-box';

const storeId = 'test';

const boxSubmission: MarketplaceBoxSubmission = {
  donationRate: 0.1,
  boxItem: {
    itemID: 'item-a',
    batches: [
      { id: '30', count: 20 }
    ]
  }
};

const key = null;

describe('Box Submission', () => {
  it('should create a box item with derived costs for marketplace', async () => {
    const { boxItems } = await calculateMarketplaceBoxPricing(key, storeId, boxSubmission);

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

    expect(wholesaleCost).to.equal(30);
    expect(serviceFee).to.equal(3);
    expect(subtotal).to.equal(33);
    expect(donation).to.equal(3);
    expect(total).to.equal(36);

    expect(warehousingCost).to.equal(0);
    expect(packagingCost).to.equal(0);
    expect(packingCost).to.equal(0);
    expect(shippingCost).to.equal(0);
    expect(creditCardFee).to.equal(0);
    expect(VAT).to.equal(0);
  });

  it('should create a box with a single box item', async () => {
    const { count: totalBoxCount, boxItems, shippingCost } = await calculateMarketplaceBoxPricing(key, storeId, boxSubmission);
    const { count: itemCount } = boxItems[0];

    expect(boxItems.length).to.equal(1);
    expect(itemCount).to.equal(20);
    expect(totalBoxCount).to.equal(20);
    expect(shippingCost).to.equal(0);
  });
});

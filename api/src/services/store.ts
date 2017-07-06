import { calculateServiceFee, getStoreFromId } from '@honesty-store/store';

export interface StoreItem {
  id: string;
  name: string;
  qualifier?: string;
  image: string;
  isMarketplace: boolean;
  count: number;
  price: {
    total: number;
    breakdown: PriceBreakdown;
  };
}

export interface PriceBreakdown {
  wholesaleCost: number;
  serviceFee: number;
  donation: number;
  handlingFee: number;
  creditCardFee: number;
  VAT: number;
}

export const getItemPriceFromStore = async (key, storeId: string, itemId: string): Promise<number> => {
  const { items } = await getStoreFromId(key, storeId);
  const { price } = items.find(item => item.id === itemId);
  return price;
};

export const calculateDonation = (storeId: string, price: number): number =>
  storeId === '9a61dad3-f05c-46aa-a7e4-14311e9cccc5' ? Math.ceil(price * 0.1) : 0;

export const storeItems = async (key, storeId): Promise<StoreItem[]> => {
  const { items } = await getStoreFromId(key, storeId);
  return items.map(item => {
    const donation = calculateDonation(storeId, item.price);
    const serviceFee = calculateServiceFee(item.price);
    return {
      id: item.id,
      name: item.name,
      qualifier: item.qualifier,
      image: item.image,
      isMarketplace: true,
      count: item.availableCount,
      price: {
        total: item.price + donation,
        breakdown: {
          wholesaleCost: item.price - serviceFee,
          serviceFee: serviceFee,
          donation,
          handlingFee: 0,
          creditCardFee: 0,
          VAT: 0
        }
      },
      sellerId: item.sellerId
    };
  });
};

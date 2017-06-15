import { getStoreFromId } from '@honesty-store/store';

export interface StoreItem {
  id: string;
  name: string;
  qualifier?: string;
  genericName: string;
  genericNamePlural: string;
  unit: string;
  unitPlural: string;
  image: string;
  isMarketplace: boolean;
  count: number;
  price: {
    total: number;
    breakdown: PriceBreakdown;
  };
  expiry?: number;
  weight?: number;
  location?: string;
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

const calculateServiceFee = (price: number): number =>
  Math.ceil(price / 1.1 * 0.1);

const calculateDonation = (storeId: string, price: number): number =>
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
      genericName: item.genericName,
      genericNamePlural: item.genericNamePlural,
      unit: item.unit,
      unitPlural: item.unitPlural,
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
      }
    };
  });
};

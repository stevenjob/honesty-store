import {
  StoreRevenue
} from './client';

const HISTORIC_BUCKET_COUNT = 5;

export default (revenue: StoreRevenue[], sellerId: string, amount: number, now: number = Date.now()): StoreRevenue[] => {
  const existingBucket = revenue[0];

  if (existingBucket != null && existingBucket.startInclusive > now) {
    throw new Error(`Timestamp ${now} too old ${existingBucket.startInclusive}`);
  }

  if (existingBucket != null && now < existingBucket.endExclusive) {
    const existingSellerRevenue = existingBucket.seller[sellerId] || 0;
    return [
      {
        ...existingBucket,
        seller: {
          ...existingBucket.seller,
          [sellerId]: existingSellerRevenue + amount
        },
        total: existingBucket.total + amount
      },
      ...revenue.slice(1, HISTORIC_BUCKET_COUNT)
    ];
  } else {
    const date = new Date(now);

    return [
      {
        startInclusive: Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
        endExclusive: Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1),
        total: amount,
        seller: {
          [sellerId]: amount
        }
      },
      ...revenue.slice(0, HISTORIC_BUCKET_COUNT)
    ];
  }
};

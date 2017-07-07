import {
  StoreRevenue
} from './client';
import calculateRevenue from './revenue';

describe('Revenue', () => {

  const maxPreviousBucketNow = Date.UTC(2017, 4, 30, 23, 59, 59, 999);
  const minBucketNow = Date.UTC(2017, 5, 1, 0, 0, 0, 0);
  const someNow = Date.UTC(2017, 5, 6, 10, 30, 5, 123);
  const maxBucketNow = Date.UTC(2017, 5, 30, 23, 59, 59, 999);
  const minNextBucketNow = Date.UTC(2017, 6, 1, 0, 0, 0, 0);

  it('should create the first bucket', () => {
    const result = calculateRevenue([], 'seller', 1, someNow);
    expect(result).toEqual([
      {
        startInclusive: minBucketNow,
        endExclusive: minNextBucketNow,
        total: 1,
        seller: {
          seller: 1
        }
      }
    ]);
  });

  it('should assign to an existing bucket', () => {
    const existing = [
      {
        startInclusive: minBucketNow,
        endExclusive: minNextBucketNow,
        total: 1,
        seller: {
          seller: 1
        }
      }
    ];
    const result = calculateRevenue(existing, 'seller', 2, someNow);
    expect(result).toEqual([
      {
        startInclusive: minBucketNow,
        endExclusive: minNextBucketNow,
        total: 3,
        seller: {
          seller: 3
        }
      }
    ]);
  });

  it('should assign to an existing bucket (min)', () => {
    const existing = [
      {
        startInclusive: minBucketNow,
        endExclusive: minNextBucketNow,
        total: 1,
        seller: {
          seller: 1
        }
      }
    ];
    const result = calculateRevenue(existing, 'seller', 1, minBucketNow);
    expect(result).toEqual([
      {
        startInclusive: minBucketNow,
        endExclusive: minNextBucketNow,
        total: 2,
        seller: {
          seller: 2
        }
      }
    ]);
  });

  it('should assign to an existing bucket (max)', () => {
    const existing = [
      {
        startInclusive: minBucketNow,
        endExclusive: minNextBucketNow,
        total: 1,
        seller: {
          seller: 1
        }
      }
    ];
    const result = calculateRevenue(existing, 'seller', 1, maxBucketNow);
    expect(result).toEqual([
      {
        startInclusive: minBucketNow,
        endExclusive: minNextBucketNow,
        total: 2,
        seller: {
          seller: 2
        }
      }
    ]);
  });

  it('should roll over to a new bucket (min)', () => {
    const existing = [
      {
        startInclusive: maxPreviousBucketNow,
        endExclusive: maxPreviousBucketNow,
        total: 1,
        seller: {
          seller: 1
        }
      }
    ];
    const result = calculateRevenue(existing, 'seller', 1, minBucketNow);
    expect(result).toEqual([
      {
        startInclusive: minBucketNow,
        endExclusive: minNextBucketNow,
        total: 1,
        seller: {
          seller: 1
        }
      },
      {
        startInclusive: maxPreviousBucketNow,
        endExclusive: maxPreviousBucketNow,
        total: 1,
        seller: {
          seller: 1
        }
      }
    ]);
  });

  it('should throw if existing bucket starts in the future', () => {
    const existing = [
      {
        startInclusive: minNextBucketNow,
        endExclusive: minNextBucketNow,
        total: 1,
        seller: {
          seller: 1
        }
      }
    ];
    expect(() => {
      calculateRevenue(existing, 'seller', 1, someNow);
    }).toThrow(`Timestamp ${someNow} too old ${minNextBucketNow}`);
  });

  it('should truncate more than 6 buckets', () => {
    const existing = [
      {
        startInclusive: maxPreviousBucketNow,
        endExclusive: maxPreviousBucketNow,
        total: 1,
        seller: {
          seller: 1
        }
      },
      <StoreRevenue>{},
      <StoreRevenue>{},
      <StoreRevenue>{},
      <StoreRevenue>{},
      <StoreRevenue>{}
    ];
    const result = calculateRevenue(existing, 'seller', 1, minBucketNow);
    expect(result).toEqual([
      {
        startInclusive: minBucketNow,
        endExclusive: minNextBucketNow,
        total: 1,
        seller: {
          seller: 1
        }
      },
      {
        startInclusive: maxPreviousBucketNow,
        endExclusive: maxPreviousBucketNow,
        total: 1,
        seller: {
          seller: 1
        }
      },
      <StoreRevenue>{},
      <StoreRevenue>{},
      <StoreRevenue>{},
      <StoreRevenue>{}
    ]);
  });

  it('should assign a new seller to an existing bucket', () => {
    const existing = [
      {
        startInclusive: minBucketNow,
        endExclusive: minNextBucketNow,
        total: 1,
        seller: {
          seller: 1
        }
      }
    ];
    const result = calculateRevenue(existing, 'seller2', 2, someNow);
    expect(result).toEqual([
      {
        startInclusive: minBucketNow,
        endExclusive: minNextBucketNow,
        total: 3,
        seller: {
          seller: 1,
          seller2: 2
        }
      }
    ]);
  });
});

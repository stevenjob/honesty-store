import { VariableBoxItemOverheads, FixedBoxItemOverheads } from './client';

type CombinedCosts = VariableBoxItemOverheads & FixedBoxItemOverheads;

export const sum = <T>(items: T[], projection: (item: T) => number) =>
  items.map(projection)
    .reduce((a, b) => a + b, 0);

export const avg = <T>(items: T[], projection: (item: T) => { count: number, value: number }) => {
  const totals = items.map(projection)
    .reduce(
      (
        { totalCount, totalValue },
        { count, value }
      ) => ({
        totalCount: totalCount + count,
        totalValue: totalValue + value * count
      }),
      { totalValue: 0, totalCount: 0 }
    );
  return totals.totalValue / totals.totalCount;
};

export const roundItemCosts = (costs: CombinedCosts): CombinedCosts => {
  const roundedCosts: CombinedCosts = Object.assign({}, ...Object.keys(costs).map((key) => {
    const cost = costs[key];
    return { [key]: Math.round(cost) };
  }));

  const { total, serviceFee, subtotal, ...nonTotalCosts } = roundedCosts;

  const sumOfCosts = ([
    ...Object.keys(nonTotalCosts).map(key => nonTotalCosts[key]),
    serviceFee
  ] as number[])
  .reduce((accumulated, current) => accumulated + current, 0);

  const diff = total - sumOfCosts;

  const adjustedServiceFee = serviceFee + diff;

  if (adjustedServiceFee < 0) {
    throw new Error(`Service fee would be less than 0`);
  }

  return {
    ...roundedCosts,
    serviceFee: adjustedServiceFee
  };
};

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

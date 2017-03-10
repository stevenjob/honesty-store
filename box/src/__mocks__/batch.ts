
export const getItemCostInBatchExcludingVAT = (batchId: string): number => {
  return Number(batchId);
};

export const getVAT = (_batchId: string): number => {
  return 0.2;
};

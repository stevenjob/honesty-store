
export const getItemCost = (batchId: string): number => {
  return Number(batchId);
};

export const getVATRate = (_batchId: string): number => {
  return 0.2;
};

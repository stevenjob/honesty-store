export const getItemCost = async (_key, batchId: string) => {
  return Number(batchId);
};

export const getVATRate = async (_key, _batchId: string) => {
  return 0.2;
};

export const getExpiry = async (_key, _batchId: string) => {
  return 0;
};

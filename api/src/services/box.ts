const boxes = new Map();
boxes.set(0, {
  items: [
    { itemID: '46ced0c0-8815-4ed2-bfb6-40537f5bd512', count: 10 },
    { itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae', count: 35 },
    { itemID: 'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8', count: 28 },
    { itemID: '78816fba-150d-4282-b43d-900df45cea8b', count: 14 },
    { itemID: '3fa0db7c-3f90-404e-b875-3792eda3e185', count: 25 }
  ]
});

export const getBox = (boxID) => {
  const box = boxes.get(boxID);
  if (box == null) {
    throw new Error(`Box does not exist with ID '${boxID}'`);
  }
  return box;
};

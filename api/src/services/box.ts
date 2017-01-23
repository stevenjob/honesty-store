const boxes = new Map();
boxes.set(0, {
  items: [
    { itemID: '0', count: 10 },
    { itemID: '1', count: 35 },
    { itemID: '2', count: 28 },
    { itemID: '3', count: 20 },
    { itemID: '4', count: 27 },
  ],
});

export const getBox = (boxID) => {
  const box = boxes.get(boxID);
  if (box == null) {
    throw new Error(`Box does not exist with ID '${boxID}'`);
  }
  return box;
};

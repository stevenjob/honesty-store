const boxes = new Map();

// ncl
boxes.set('032503e2-6cd3-4101-92bb-49bc26a5027e', {
  items: [
    { itemID: '46ced0c0-8815-4ed2-bfb6-40537f5bd512', count: 10 },
    { itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae', count: 35 },
    { itemID: 'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8', count: 28 },
    { itemID: '78816fba-150d-4282-b43d-900df45cea8b', count: 14 },
    { itemID: '3fa0db7c-3f90-404e-b875-3792eda3e185', count: 25 }
  ]
});

// brs, edn, ldn
boxes.set('32e0a7e1-38b4-42ce-b29d-6c70d346089a', {
  items: [
    { itemID: '28b0a802-bef3-478b-81d0-034e3ac02092', count: 15 },
    { itemID: 'b3cad9b1-56fb-446d-987a-da79b8f75140', count: 34 },
    { itemID: '9d75c0d8-0c37-4828-90a4-d8cdc0ba9582', count: 16 },
    { itemID: '41ed2c85-6ef6-4079-b8a3-aeeb41ba13b3', count: 12 },
    { itemID: '678ada89-7050-45ee-bed9-5c46da6bc053', count: 27 }
  ]
});

export const getBox = (boxID) => {
  const box = boxes.get(boxID);
  if (box == null) {
    throw new Error(`Box does not exist with ID '${boxID}'`);
  }
  return box;
};

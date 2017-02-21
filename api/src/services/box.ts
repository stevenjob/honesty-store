import { getItem } from './item';

// A box represents the physical box dispatched to agents
const items = [
  // ncl
  {
    id: '032503e2-6cd3-4101-92bb-49bc26a5027e',
    items: [
      { itemID: '46ced0c0-8815-4ed2-bfb6-40537f5bd512', count: 10 },
      { itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae', count: 35 },
      { itemID: 'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8', count: 28 },
      { itemID: '78816fba-150d-4282-b43d-900df45cea8b', count: 14 },
      { itemID: '02bbc0fd-54c4-45bb-9b77-21b79b356aa6', count: 25 }
    ],
    packed: '20170130',
    shipped: '20170130',
    recieved: '20170130'
  },
  {
    id: '091be502-19ec-48f3-aad3-3091575d0fd4',
    items: [
      { itemID: '46ced0c0-8815-4ed2-bfb6-40537f5bd512', count: 1 },
      { itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae', count: 34 },
      { itemID: 'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8', count: 16 },
      { itemID: '78816fba-150d-4282-b43d-900df45cea8b', count: 12 },
      { itemID: '02bbc0fd-54c4-45bb-9b77-21b79b356aa6', count: 54 },
      { itemID: '28b0a802-bef3-478b-81d0-034e3ac02092', count: 3 },
      { itemID: '606e12d4-6367-4fc3-aa7a-92ee17ccac2c', count: 2 },
      { itemID: 'e91e7274-fe28-405c-86c8-5768197eb6ac', count: 16 },
      { itemID: '32919485-d806-4be6-824b-170f66371306', count: 15 },
      { itemID: '272c6a59-9b4c-41b6-b839-0f8be506728e', count: 20 },
      { itemID: '8e9bb2db-9437-4733-acc1-f5e218e0a603', count: 1 }
    ],
    packed: '20170208',
    shipped: '20170208',
    recieved: '20170208'
  },
  {
    id: 'af02cf9f-d8b7-4d7e-a701-3addb212a7ba',
    items: [
      { itemID: 'cf7a7886-c30d-4760-8c15-39adb2dc8649', count: 30 }
    ],
    packed: '20170213',
    shipped: '20170213',
    recieved: '20170213',
    closed: '20170221'
  },
  {
    id: '680a2849-4a37-47f0-88a6-b9b1df91d5f4',
    items: [
      { itemID: 'cf7a7886-c30d-4760-8c15-39adb2dc8649', count: 30 },
      { itemID: 'd5d10152-3f8a-419b-9abd-6d6e916ea64a', count: 30 }
    ],
    packed: '20170221',
    shipped: '20170221',
    recieved: '20170221'
  },

  // brs, edn, ldn
  {
    id: '32e0a7e1-38b4-42ce-b29d-6c70d346089a',
    items: [
      { itemID: '28b0a802-bef3-478b-81d0-034e3ac02092', count: 15 },
      { itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae', count: 34 },
      { itemID: 'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8', count: 16 },
      { itemID: '78816fba-150d-4282-b43d-900df45cea8b', count: 12 },
      { itemID: '3fa0db7c-3f90-404e-b875-3792eda3e185', count: 27 }
    ],
    packed: '20170206',
    shipped: '20170207',
    recieved: '20170208'
  },
  {
    id: 'df29f676-0fbb-44dd-8687-6bb2a3f5bb38',
    items: [
      { itemID: '28b0a802-bef3-478b-81d0-034e3ac02092', count: 15 },
      { itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae', count: 34 },
      { itemID: 'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8', count: 16 },
      { itemID: '78816fba-150d-4282-b43d-900df45cea8b', count: 12 },
      { itemID: '3fa0db7c-3f90-404e-b875-3792eda3e185', count: 27 }
    ],
    packed: '20170206',
    shipped: '20170207',
    recieved: '20170208'
  },
  {
    id: '1a6b272d-7bbb-4cc6-a84f-653a5087dc0f',
    items: [
      { itemID: '28b0a802-bef3-478b-81d0-034e3ac02092', count: 15 },
      { itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae', count: 34 },
      { itemID: 'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8', count: 16 },
      { itemID: '78816fba-150d-4282-b43d-900df45cea8b', count: 12 },
      { itemID: '3fa0db7c-3f90-404e-b875-3792eda3e185', count: 27 }
    ],
    packed: '20170206',
    shipped: '20170207',
    recieved: '20170208'
  }
];

const boxes = new Map();

for (const item of items) {
  if (boxes.has(item.id)) {
    throw new Error(`Duplicate ID ${item.id}`);
  }
  for (const { itemID } of item.items) {
    // ensure the itemID is valid
    getItem(itemID);
  }
  boxes.set(item.id, item);
}

export const getBox = (boxID) => {
  const box = boxes.get(boxID);
  if (box == null) {
    throw new Error(`Box does not exist with ID '${boxID}'`);
  }
  return box;
};

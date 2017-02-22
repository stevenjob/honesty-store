interface Item {
  name: string;
  image: string;
  weight: number;
  notes?: string;
}

const items = [
  {
    id: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
    name: 'Walkers',
    image: 'walkers-cheese-onion.svg',
    weight: 32.5,
    notes: 'Cheese & Onion'
  },
  {
    id: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
    name: 'Crunchy Oats & Honey',
    image: 'nature-valley-oats-n-honey.svg',
    weight: 42
  },
  {
    id: 'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8',
    name: 'Snickers',
    image: 'snickers.svg',
    weight: 48
  },
  {
    id: '78816fba-150d-4282-b43d-900df45cea8b',
    name: 'Skittles',
    image: 'skittles.svg',
    weight: 55
  },
  {
    id: '3fa0db7c-3f90-404e-b875-3792eda3e185',
    name: 'KitKat Chunky',
    image: 'kit-kat-chunky.svg',
    weight: 40
  },
  {
    id: '02bbc0fd-54c4-45bb-9b77-21b79b356aa6',
    name: 'KitKat Chunky',
    image: 'kit-kat-chunky.svg',
    weight: 40,
    notes: 'Multipack not for individual resale'
  },
  {
    id: '28b0a802-bef3-478b-81d0-034e3ac02092',
    name: 'Walkers',
    image: 'walkers-salt-vinegar.svg',
    weight: 32.5,
    notes: 'Salt & Vinegar'
  },
  {
    id: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
    name: 'Diet Coke (Fridge)',
    image: 'diet-cola-can.svg',
    weight: 400,
    notes: 'Multipack not for individual resale. NCL trial only, Simon Watson sourcing'
  },
  {
    id: 'd5d10152-3f8a-419b-9abd-6d6e916ea64a',
    name: 'Coke Zero (Fridge)',
    image: 'coca-cola-zero-can.svg',
    weight: 400,
    notes: 'Multipack not for individual resale. NCL trial only, Simon Watson sourcing'
  },
  {
    id: '606e12d4-6367-4fc3-aa7a-92ee17ccac2c',
    name: 'Freddo',
    image: 'freddo.svg',
    weight: 19.5,
    notes: 'Price marked 25p'
  },
  {
    id: 'e91e7274-fe28-405c-86c8-5768197eb6ac',
    name: 'Smarties',
    image: 'misc-bar.svg',
    weight: 38
  },
  {
    id: '32919485-d806-4be6-824b-170f66371306',
    name: 'Geo Bar',
    image: 'misc-bar.svg',
    weight: 35,
    notes: 'Wild Apricot'
  },
  {
    id: '272c6a59-9b4c-41b6-b839-0f8be506728e',
    name: 'Divine',
    image: 'misc-bar.svg',
    weight: 40,
    notes: 'Caramel Milk Chocolate'
  },
  {
    id: '8e9bb2db-9437-4733-acc1-f5e218e0a603',
    name: 'Fruit Pastilles',
    image: 'misc-bar.svg',
    weight: 52.5
  },
  {
    id: '96ce1162-9188-41ac-9d35-8fc6a14783ef',
    name: 'Oreo',
    image: 'misc-bar.svg',
    weight: 66,
    notes: '6 pack'
  },
  {
    id: '3b7a6669-770c-4dbb-97e2-0e0aae3ca5ff',
    name: 'Walkers (Box)',
    image: 'misc-crisps.svg',
    weight: 22,
    notes: 'Multipack not for individual resale. Residual stock. Wotsits, Quavers & Monster Munch'
  }
];

const stockItems = new Map<string, Item>();
for (const item of items) {
  if (stockItems.has(item.id)) {
    throw new Error(`Duplicate ID ${item.id}`);
  }
  stockItems.set(item.id, item);
}

export const getItem = (itemID: string) => {
  const item = stockItems.get(itemID);
  if (item == null) {
    throw new Error(`Item does not exist with ID '${itemID}'`);
  }
  return item;
};

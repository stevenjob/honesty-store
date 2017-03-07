interface Item {
  name: string;
  qualifier?: string;
  unit: 'Pack' | 'Tube' | 'Bar';
  unitPlural: 'Packs' | 'Tubes' | 'Bars';
  genericName: 'Crisps' | 'Sweets' | 'Chocolate' | 'Flapjack' | 'Can' | 'Biscuit' | 'Nuts' | 'Cereal bar';
  image: string;
  weight: number;
  notes?: string;
}

const items: (Item & { id: string })[] = [
  {
    id: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
    name: 'Cheese & Onion',
    image: 'walkers-cheese-onion.svg',
    weight: 32.5,
    qualifier: 'Walkers',
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Crisps'
  },
  {
    id: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
    name: 'Crunchy Oats & Honey',
    image: 'nature-valley-oats-n-honey.svg',
    weight: 42,
    unit: 'Bar',
    unitPlural: 'Bars',
    genericName: 'Cereal bar'
  },
  {
    id: 'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8',
    name: 'Snickers',
    image: 'snickers.svg',
    weight: 48,
    unit: 'Bar',
    unitPlural: 'Bars',
    genericName: 'Chocolate'
  },
  {
    id: '78816fba-150d-4282-b43d-900df45cea8b',
    name: 'Skittles',
    image: 'skittles.svg',
    weight: 55,
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Sweets'
  },
  {
    id: '3fa0db7c-3f90-404e-b875-3792eda3e185',
    name: 'KitKat Chunky',
    image: 'kit-kat-chunky.svg',
    weight: 40,
    unit: 'Bar',
    unitPlural: 'Bars',
    genericName: 'Chocolate'
  },
  {
    id: '02bbc0fd-54c4-45bb-9b77-21b79b356aa6',
    name: 'KitKat Chunky',
    image: 'kit-kat-chunky.svg',
    weight: 40,
    notes: 'Multipack not for individual resale',
    unit: 'Bar',
    unitPlural: 'Bars',
    genericName: 'Chocolate'
  },
  {
    id: '28b0a802-bef3-478b-81d0-034e3ac02092',
    name: 'Salt & Vinegar',
    image: 'walkers-salt-vinegar.svg',
    weight: 32.5,
    qualifier: 'Walkers',
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Crisps'
  },
  {
    id: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
    name: 'Diet Coke (Fridge)',
    image: 'diet-cola-can.svg',
    weight: 400,
    notes: 'Multipack not for individual resale. NCL trial only, Simon Watson sourcing',
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Can'
  },
  {
    id: 'd5d10152-3f8a-419b-9abd-6d6e916ea64a',
    name: 'Coke Zero (Fridge)',
    image: 'coca-cola-zero-can.svg',
    weight: 400,
    notes: 'Multipack not for individual resale. NCL trial only, Simon Watson sourcing',
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Can'
  },
  {
    id: 'ccad58e3-e27a-4463-9139-17a36ff7f7b8',
    name: 'Coke (Fridge)',
    image: 'coca-cola-can.svg',
    weight: 400,
    notes: 'Multipack not for individual resale. NCL trial only, Simon Watson sourcing',
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Can'
  },
  {
    id: '606e12d4-6367-4fc3-aa7a-92ee17ccac2c',
    name: 'Freddo',
    image: 'freddo.svg',
    weight: 19.5,
    notes: 'Price marked 25p. Residual stock.',
    unit: 'Bar',
    unitPlural: 'Bars',
    genericName: 'Chocolate'
  },
  {
    id: 'e91e7274-fe28-405c-86c8-5768197eb6ac',
    name: 'Smarties',
    image: 'misc-bar.svg',
    weight: 38,
    notes: 'Residual stock.',
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Sweets'
  },
  {
    id: '32919485-d806-4be6-824b-170f66371306',
    name: 'Wild Apricot',
    image: 'misc-bar.svg',
    weight: 35,
    notes: 'Residual stock.',
    qualifier: 'Geo Bar',
    unit: 'Bar',
    unitPlural: 'Bars',
    genericName: 'Flapjack'
  },
  {
    id: '272c6a59-9b4c-41b6-b839-0f8be506728e',
    name: 'Caramel Milk Chocolate',
    image: 'misc-bar.svg',
    weight: 40,
    notes: 'Residual stock.',
    qualifier: 'Divine',
    unit: 'Bar',
    unitPlural: 'Bars',
    genericName: 'Chocolate'
  },
  {
    id: '8e9bb2db-9437-4733-acc1-f5e218e0a603',
    name: 'Fruit Pastilles',
    image: 'misc-bar.svg',
    weight: 52.5,
    notes: 'Residual stock.',
    unit: 'Bar',
    unitPlural: 'Bars',
    genericName: 'Sweets'
  },
  {
    id: '96ce1162-9188-41ac-9d35-8fc6a14783ef',
    name: 'Oreo',
    image: 'misc-bar.svg',
    weight: 66,
    notes: '6 pack, residual stock.',
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Biscuit'
  },
  {
    id: '3b7a6669-770c-4dbb-97e2-0e0aae3ca5ff',
    name: 'Walkers (Box)',
    image: 'misc-crisps.svg',
    weight: 22,
    notes: 'Multipack not for individual resale. Residual stock.',
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Crisps'
  },
  {
    id: '8fd928e0-06c9-4958-9259-719dc451a8c2',
    name: 'Smoky Bacon',
    qualifier: 'Popchips',
    image: 'popchips-ridges-smokey-bacon.svg',
    weight: 23,
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Crisps'
  },
  {
    id: 'edef6848-f3d5-4733-babc-bc10bc3d257c',
    name: 'Sea Salt & Vinegar',
    qualifier: 'Popchips',
    image: 'popchips-ridges-salt-vinegar.svg',
    weight: 23,
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Crisps'
  },
  {
    id: '64e177af-6313-4d9e-b39a-8495c2f1d939',
    name: 'Love Corn',
    image: 'love-corn-habanero.svg',
    weight: 20,
    qualifier: 'Habanero',
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Crisps'
  },
  {
    id: '54e10706-284f-440f-82cb-0f8911a8424a',
    name: 'Fiery Worcester Sauce',
    qualifier: 'Propercorn',
    image: 'propercorn-fiery-worcester.svg',
    weight: 20,
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Crisps'
  },
  {
    id: '80984458-bab9-4a8f-86a7-b3e46f62139d',
    name: 'Lightly Sea Salted',
    qualifier: 'Propercorn',
    image: 'propercorn-lightly-salted.svg',
    weight: 20,
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Crisps'
  },
  {
    id: '32a9520f-f407-42ee-9bc5-ab9e2a9c76ea',
    name: 'Apple Crunch Bar',
    qualifier: 'Nakd',
    image: 'nakd-apple-crunch.svg',
    weight: 30,
    unit: 'Bar',
    unitPlural: 'Bars',
    genericName: 'Flapjack'
  },
  {
    id: 'f0167eb4-f906-48d8-8067-6e3b646d8a19',
    name: 'Coconut Bliss Nibbles',
    qualifier: 'Nakd',
    image: 'nakd-coconut-bliss-nibbles.svg',
    weight: 40,
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Nuts'
  },
  {
    id: 'fc3f3a7a-64bc-4f23-9a4e-c90f2536e56b',
    name: 'Fruit & Nut',
    qualifier: 'Snack Shot',
    image: 'fruit-n-nuts-cranberry.svg',
    weight: 40,
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Nuts'
  },
  {
    id: 'b78c3975-eb7f-4eda-a3ea-d54d35e6471e',
    name: 'Coconut & Berry Energy Boost',
    qualifier: 'Super Seeds',
    image: 'good4u-superseed-coconut-berry.svg',
    weight: 25,
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Nuts'
  },
  {
    id: '5298c925-9ae2-4017-a007-c1928c38ddc6',
    name: 'Banana Bread Flapjack',
    qualifier: 'Trek',
    image: 'trek-banana-bread-flapjack.svg',
    weight: 50,
    unit: 'Pack',
    unitPlural: 'Packs',
    genericName: 'Flapjack'
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

interface Item {
  name: string;
  qualifier?: string;
  genericName: string;
  genericNamePlural: string;
  unit: string;
  unitPlural: string;
  location?: string;
  image: string;
  weight?: number;
  notes?: string;
}

const items: (Item & { id: string })[] = [
  {
    id: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
    name: 'Walkers',
    image: 'walkers-cheese-onion.svg',
    weight: 32.5,
    qualifier: 'Cheese & Onion',
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'crisps',
    genericNamePlural: 'crisps'
  },
  {
    id: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
    name: 'Nature Valley',
    qualifier: 'Crunchy Oats & Honey',
    image: 'nature-valley-oats-n-honey.svg',
    weight: 42,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'cereal bar',
    genericNamePlural: 'cereal bars'
  },
  {
    id: 'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8',
    name: 'Snickers',
    image: 'snickers.svg',
    weight: 48,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'chocolate bar',
    genericNamePlural: 'chocolate'
  },
  {
    id: '78816fba-150d-4282-b43d-900df45cea8b',
    name: 'Skittles',
    image: 'skittles.svg',
    weight: 55,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'sweets',
    genericNamePlural: 'sweets'
  },
  {
    id: '3fa0db7c-3f90-404e-b875-3792eda3e185',
    name: 'KitKat Chunky',
    image: 'kit-kat-chunky.svg',
    weight: 40,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'chocolate bar',
    genericNamePlural: 'chocolate'
  },
  {
    id: '02bbc0fd-54c4-45bb-9b77-21b79b356aa6',
    name: 'KitKat Chunky',
    image: 'kit-kat-chunky.svg',
    weight: 40,
    notes: 'Multipack not for individual resale',
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'chocolate bar',
    genericNamePlural: 'chocolate'
  },
  {
    id: '28b0a802-bef3-478b-81d0-034e3ac02092',
    name: 'Walkers',
    image: 'walkers-salt-vinegar.svg',
    weight: 32.5,
    qualifier: 'Salt & Vinegar',
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'crisps',
    genericNamePlural: 'crisps'
  },
  {
    id: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
    name: 'Diet Coke',
    location: 'Fridge',
    image: 'diet-cola-can.svg',
    weight: 400,
    unit: 'can',
    unitPlural: 'cans',
    genericName: 'drink',
    genericNamePlural: 'drinks'
  },
  {
    id: 'd5d10152-3f8a-419b-9abd-6d6e916ea64a',
    name: 'Coke Zero',
    location: 'Fridge',
    image: 'coca-cola-zero-can.svg',
    weight: 400,
    unit: 'can',
    unitPlural: 'cans',
    genericName: 'drink',
    genericNamePlural: 'drinks'
  },
  {
    id: 'ccad58e3-e27a-4463-9139-17a36ff7f7b8',
    name: 'Coke',
    location: 'Fridge',
    image: 'coca-cola-can.svg',
    weight: 400,
    unit: 'can',
    unitPlural: 'cans',
    genericName: 'drink',
    genericNamePlural: 'drinks'
  },
  {
    id: 'e615de4e-ce10-451b-80ad-9717662a904a',
    name: 'Pepsi Max',
    location: 'Fridge',
    image: 'pepsi-max-can.svg',
    weight: 400,
    unit: 'can',
    unitPlural: 'cans',
    genericName: 'drink',
    genericNamePlural: 'drinks'
  },
  {
    id: '606e12d4-6367-4fc3-aa7a-92ee17ccac2c',
    name: 'Freddo',
    image: 'freddo.svg',
    weight: 19.5,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'chocolate bar',
    genericNamePlural: 'chocolate'
  },
  {
    id: 'e91e7274-fe28-405c-86c8-5768197eb6ac',
    name: 'Smarties',
    image: 'misc-bar.svg',
    weight: 38,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'sweets',
    genericNamePlural: 'sweets'
  },
  {
    id: '32919485-d806-4be6-824b-170f66371306',
    name: 'Geo Bar',
    image: 'misc-bar.svg',
    weight: 35,
    qualifier: 'Wild Apricot',
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'cereal bar',
    genericNamePlural: 'cereal bars'
  },
  {
    id: '272c6a59-9b4c-41b6-b839-0f8be506728e',
    name: 'Divine',
    image: 'misc-bar.svg',
    weight: 40,
    qualifier: 'Caramel Milk Chocolate',
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'chocolate bar',
    genericNamePlural: 'chocolate'
  },
  {
    id: '8e9bb2db-9437-4733-acc1-f5e218e0a603',
    name: 'Fruit Pastilles',
    image: 'fruit-pastilles-roll.svg',
    weight: 52.5,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'sweets',
    genericNamePlural: 'sweets'
  },
  {
    id: '96ce1162-9188-41ac-9d35-8fc6a14783ef',
    name: 'Oreo',
    image: 'misc-bar.svg',
    weight: 66,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'biscuits',
    genericNamePlural: 'biscuits'
  },
  {
    id: '3b7a6669-770c-4dbb-97e2-0e0aae3ca5ff',
    name: 'Walkers (Box)',
    image: 'misc-crisps.svg',
    weight: 22,
    notes: 'Multipack not for individual resale.',
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'crisps',
    genericNamePlural: 'crisps'
  },
  {
    id: '8fd928e0-06c9-4958-9259-719dc451a8c2',
    name: 'Popchips',
    qualifier: 'Smoky Bacon',
    image: 'popchips-ridges-smokey-bacon.svg',
    weight: 23,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'crisps',
    genericNamePlural: 'crisps'
  },
  {
    id: 'edef6848-f3d5-4733-babc-bc10bc3d257c',
    name: 'Popchips',
    qualifier: 'Sea Salt & Vinegar',
    image: 'popchips-ridges-salt-vinegar.svg',
    weight: 23,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'crisps',
    genericNamePlural: 'crisps'
  },
  {
    id: '64e177af-6313-4d9e-b39a-8495c2f1d939',
    name: 'Love Corn',
    image: 'love-corn-habanero.svg',
    weight: 20,
    qualifier: 'Habanero',
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'snack',
    genericNamePlural: 'snacks'
  },
  {
    id: '54e10706-284f-440f-82cb-0f8911a8424a',
    name: 'Propercorn',
    qualifier: 'Fiery Worcester Sauce',
    image: 'propercorn-fiery-worcester.svg',
    weight: 20,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'popcorn',
    genericNamePlural: 'popcorn'
  },
  {
    id: '80984458-bab9-4a8f-86a7-b3e46f62139d',
    name: 'Propercorn',
    qualifier: 'Lightly Sea Salted',
    image: 'propercorn-lightly-salted.svg',
    weight: 20,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'popcorn',
    genericNamePlural: 'popcorn'
  },
  {
    id: '32a9520f-f407-42ee-9bc5-ab9e2a9c76ea',
    name: 'Nakd',
    qualifier: 'Apple Crunch Bar',
    image: 'nakd-apple-crunch.svg',
    weight: 30,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'cereal bar',
    genericNamePlural: 'cereal bars'
  },
  {
    id: 'f0167eb4-f906-48d8-8067-6e3b646d8a19',
    name: 'Nakd',
    qualifier: 'Coconut Bliss Nibbles',
    image: 'nakd-coconut-bliss-nibbles.svg',
    weight: 40,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'snack',
    genericNamePlural: 'snacks'
  },
  {
    id: 'fc3f3a7a-64bc-4f23-9a4e-c90f2536e56b',
    name: 'Snack Shot',
    qualifier: 'Fruit & Nut',
    image: 'fruit-n-nuts-cranberry.svg',
    weight: 40,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'snack',
    genericNamePlural: 'snacks'
  },
  {
    id: 'b78c3975-eb7f-4eda-a3ea-d54d35e6471e',
    name: 'Super Seeds',
    qualifier: 'Coconut & Berry Energy Boost',
    image: 'good4u-superseed-coconut-berry.svg',
    weight: 25,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'snack',
    genericNamePlural: 'snacks'
  },
  {
    id: '5298c925-9ae2-4017-a007-c1928c38ddc6',
    name: 'Trek',
    qualifier: 'Banana Bread Flapjack',
    image: 'trek-banana-bread-flapjack.svg',
    weight: 50,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'protein bar',
    genericNamePlural: 'protein bars'
  },
  {
    id: 'd8c73ee1-a9b1-4090-a6ad-ee4d778a852a',
    name: 'getbuzzing Flapjack',
    qualifier: 'Mixed Berries',
    image: 'getbuzzing-mixed-berries.svg',
    weight: 62,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'flapjack',
    genericNamePlural: 'flapjacks'
  },
  {
    id: '96262a5f-8646-4644-aacc-36a3c5e4443d',
    name: 'getbuzzing Flapjack',
    qualifier: 'Mint Chocolate',
    image: 'getbuzzing-mint-choc-high-protein.svg',
    weight: 55,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'protein bar',
    genericNamePlural: 'protein bars'
  },
  {
    id: '249409b8-c7cc-4e2c-9a8b-e960c6b50029',
    name: 'Nakd',
    qualifier: 'Berry Delight',
    image: 'nakd-berry-delight.svg',
    weight: 30,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'cereal bar',
    genericNamePlural: 'cereal bars'
  },
  {
    id: 'fac94d27-732e-4f2f-8f03-75c193093dbd',
    name: 'Nakd',
    qualifier: 'Cashew Cookie',
    image: 'nakd-cashew-cookie.svg',
    weight: 30,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'cereal bar',
    genericNamePlural: 'cereal bars'
  },
  {
    id: '8bd6f737-6f64-4c18-a8b8-15c7eb1f4a77',
    name: 'Nakd',
    qualifier: 'Cocoa Orange',
    image: 'nakd-cocoa-orange.svg',
    weight: 30,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'cereal bar',
    genericNamePlural: 'cereal bars'
  },
  {
    id: '8268e7f5-0b53-48e7-b288-2251cd375e97',
    name: 'Trek',
    qualifier: 'Peanut Power',
    image: 'trek-peanut-power.svg',
    weight: 50,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'protein bar',
    genericNamePlural: 'protein bars'
  },
  {
    id: 'a97f26bd-b03e-4cdb-8105-1353b00c728a',
    name: 'Nature Valley',
    qualifier: 'Crunchy Canadian Maple Syrup',
    image: 'nature-valley-maple-syrup.svg',
    weight: 42,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'cereal bar',
    genericNamePlural: 'cereal bars'
  },
  {
    id: '63e7f62e-e2a7-45e1-8e45-17cb42f08f80',
    name: 'Nature Valley',
    qualifier: 'Crunchy Oats & Dark Chocolate',
    image: 'nature-valley-oats-dark-chocolate.svg',
    weight: 42,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'cereal bar',
    genericNamePlural: 'cereal bars'
  },
  {
    id: '190ee06f-455f-4778-b3db-1dfc74c3e966',
    name: 'Diet Coke',
    location: 'Fridge',
    image: 'diet-cola-can.svg',
    weight: 400,
    unit: 'can',
    unitPlural: 'cans',
    genericName: 'drink',
    genericNamePlural: 'drinks'
  },
  {
    id: '88efb45b-2d7a-4b75-9a57-7c2ef3b784a8',
    name: 'Double Decker',
    location: 'honesty.store box',
    image: 'misc-bar.svg',
    weight: 54.5,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'chocolate bar',
    genericNamePlural: 'chocolate'
  },
  {
    id: 'f01f533f-8bf6-4291-8fb8-a76c3bedc276',
    name: 'Twirl twin bar',
    location: 'honesty.store box',
    image: 'misc-bar.svg',
    weight: 21.5,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'chocolate bar',
    genericNamePlural: 'chocolate'
  },
  {
    id: '364677fc-f0d0-427a-976f-962be7345a6a',
    name: 'Walkers (mix)',
    location: 'Next to the HS-box',
    image: 'misc-crisps.svg',
    weight: 25,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'crisps',
    genericNamePlural: 'crisps'
  },
  {
    id: '5b96e539-a33c-40b1-8c2d-3ab388d03ba1',
    name: 'Mars bar',
    location: 'honesty.store box',
    image: 'misc-bar.svg',
    weight: 51,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'chocolate bar',
    genericNamePlural: 'chocolate'
  },
  {
    id: '4c2697cc-f84e-4b0b-9547-05cff5ea41fc',
    name: 'Rolos',
    location: 'honesty.store box',
    image: 'misc-bar.svg',
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'chocolate',
    genericNamePlural: 'chocolate'
  },
  {
    id: 'e7d57402-6f60-4fb3-a585-7651cebbd4fa',
    name: 'Wispa',
    location: 'honesty.store box',
    image: 'misc-bar.svg',
    weight: 39,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'chocolate bar',
    genericNamePlural: 'chocolate'
  },
  {
    id: '0e9401fb-e5b0-4ee1-8904-1e98ec46a244',
    name: 'McCoy\'s',
    location: 'honesty.store box',
    image: 'misc-crisps.svg',
    weight: 50,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'crisps',
    genericNamePlural: 'crisps'
  },
  {
    id: '50878e68-08b1-4ef0-8ea0-f26c3d00259a',
    name: 'Go Ahead',
    qualifier: 'Strawberry Yoghurt Break',
    location: 'honesty.store box',
    image: 'misc-bar.svg',
    weight: 35,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'bar',
    genericNamePlural: 'bars'
  },
  {
    id: '36e8008f-b077-4498-848d-c69568c13b5a',
    name: 'Go Ahead',
    qualifier: 'Forest Fruit Yogurt Breaks',
    location: 'honesty.store box',
    image: 'misc-bar.svg',
    weight: 35,
    unit: 'bar',
    unitPlural: 'bars',
    genericName: 'bar',
    genericNamePlural: 'bars'
  },
  {
    id: '200880b9-b4a2-4d08-95b6-4fc1280ad743',
    name: 'Hobnobs',
    qualifier: 'Milk Chocolate & Golden Syrup',
    location: 'honesty.store box',
    image: 'misc-bar.svg',
    weight: 30,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'biscuits',
    genericNamePlural: 'biscuits'
  },
  {
    id: '3c7b3f8d-ba8e-4d5e-a550-81fb9ccef11c',
    name: 'Hobnobs',
    qualifier: 'Milk Chocolate & Salted Caramel',
    location: 'honesty.store box',
    image: 'misc-bar.svg',
    weight: 30,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'biscuits',
    genericNamePlural: 'biscuits'
  },
  {
    id: '4b41c613-d0a9-474c-be38-f6c89f4df582',
    name: 'Seabrook (Variety)',
    location: 'Next to HS-box',
    image: 'misc-crisps.svg',
    weight: 25,
    unit: 'pack',
    unitPlural: 'packs',
    genericName: 'crisps',
    genericNamePlural: 'crisps'
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

/*
for (const { name, unitPlural, unit, genericName, qualifier } of items) {
  console.log(`${name}${qualifier ? ` (${qualifier})` : ''}`); // store page
  console.log(`How many ${unitPlural} would you like to pay for?`); // purchase page
  console.log(`Pay for one ${unit}`); // purchase page
  console.log(`Pay for x ${unitPlural}`); // purchase page
  console.log(`Enjoy your ${genericName}`); // success page
  console.log(`---------`);
}
*/

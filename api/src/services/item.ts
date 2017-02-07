const items = new Map();

const walkers = (price) => ({
  name: 'Walkers',
  image: 'walkers-ready-salted.svg',
  price
});

const natureValley = (price) => ({
  name: 'N.V. Crunchy Oats & Honey',
  image: 'nature-valley-oats-n-honey.svg',
  price
});

const snickers = (price) => ({
  name: 'Snickers',
  image: 'misc-bar.svg', // TODO
  price
});

const skittles = (price) => ({
  name: 'Skittles',
  image: 'misc-bar.svg', // TODO
  price
});

const kitKatChunky = (price) => ({
  name: 'KitKat Chunky',
  image: 'misc-bar.svg', // TODO
  price
});

items.set('46ced0c0-8815-4ed2-bfb6-40537f5bd512', walkers(50));
items.set('faeda516-bd9f-41ec-b949-7a676312b0ae', natureValley(40));
items.set('b43c4a97-1112-41ce-8f91-5a8bda0dcdc8', snickers(51));
items.set('78816fba-150d-4282-b43d-900df45cea8b', skittles(48));
items.set('3fa0db7c-3f90-404e-b875-3792eda3e185', kitKatChunky(58));

items.set('28b0a802-bef3-478b-81d0-034e3ac02092', walkers(55));
items.set('b3cad9b1-56fb-446d-987a-da79b8f75140', natureValley(45));
items.set('9d75c0d8-0c37-4828-90a4-d8cdc0ba9582', snickers(56));
items.set('41ed2c85-6ef6-4079-b8a3-aeeb41ba13b3', skittles(53));
items.set('678ada89-7050-45ee-bed9-5c46da6bc053', kitKatChunky(65));

export const getItem = (itemID) => {
  const item = items.get(itemID);
  if (item == null) {
    throw new Error(`Item does not exist with ID '${itemID}'`);
  }
  return item;
};

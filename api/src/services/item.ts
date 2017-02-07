const items = new Map();

const walkersCheeseAndOnion = {
  name: 'Walkers',
  image: 'walkers-ready-salted.svg' // TODO wrong colour
};

const walkersSaltAndVinegar = {
  name: 'Walkers',
  image: 'walkers-ready-salted.svg' // TODO wrong colour
};

const natureValley = {
  name: 'N.V. Crunchy Oats & Honey',
  image: 'nature-valley-oats-n-honey.svg'
};

const snickers = {
  name: 'Snickers',
  image: 'misc-bar.svg' // TODO
};

const skittles = {
  name: 'Skittles',
  image: 'misc-bar.svg' // TODO
};

const kitKatChunkyIndividual = {
  name: 'KitKat Chunky',
  image: 'misc-bar.svg' // TODO
};

const kitKatChunkyMultipack = {
  name: 'KitKat Chunky',
  image: 'misc-bar.svg' // TODO
};

items.set('46ced0c0-8815-4ed2-bfb6-40537f5bd512', walkersCheeseAndOnion);
items.set('faeda516-bd9f-41ec-b949-7a676312b0ae', natureValley);
items.set('b43c4a97-1112-41ce-8f91-5a8bda0dcdc8', snickers);
items.set('78816fba-150d-4282-b43d-900df45cea8b', skittles);
items.set('3fa0db7c-3f90-404e-b875-3792eda3e185', kitKatChunkyIndividual);
items.set('02bbc0fd-54c4-45bb-9b77-21b79b356aa6', kitKatChunkyMultipack);
items.set('28b0a802-bef3-478b-81d0-034e3ac02092', walkersSaltAndVinegar);

export const getItem = (itemID: string) => {
  const item = items.get(itemID);
  if (item == null) {
    throw new Error(`Item does not exist with ID '${itemID}'`);
  }
  return item;
};

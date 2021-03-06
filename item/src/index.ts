import { config } from 'aws-sdk';
import { default as cruftDDB, IHasVersion } from 'cruft-ddb';
import { v4 as uuid } from 'uuid';

import {
  assertOptional,
  assertValidString,
  createAssertValidObject,
  createAssertValidUuid
} from '@honesty-store/service/lib/assert';
import { lambdaRouter, LambdaRouter } from '@honesty-store/service/lib/lambdaRouter';
import { Item, ItemAliases, ItemDetails } from './client';

config.region = process.env.AWS_REGION;

type ItemInternal = Item & IHasVersion & { alias?: string };

const cruft = cruftDDB<ItemInternal>({
  tableName: process.env.TABLE_NAME
});

const assertValidItemId = createAssertValidUuid('itemId');
const assertValidItemDetails = createAssertValidObject<ItemDetails>({
  name: assertValidString,
  qualifier: assertOptional(assertValidString),
  image: assertValidString,
  notes: assertOptional(assertValidString)
});

const externalise = ({ id, name, qualifier, image }: ItemInternal): Item => ({
  id,
  name,
  qualifier,
  image
});

const getItem = async (itemId): Promise<Item> => {
  assertValidItemId(itemId);

  let item: ItemInternal;
  for (let id = itemId; id; id = item.alias) {
    item = await cruft.read({ id });
  }

  return externalise(item);
};

const getAllItems = async (): Promise<Item[]> => {
  const items = await cruft.__findAll({}, { limit: 1000 });
  return items
    .filter(({ alias }) => alias == null)
    .map(externalise);
};

const getAliases = async (): Promise<ItemAliases> => {
  const items = await cruft.__findAll({});
  return items
    .filter(({ alias }) => alias != null)
    .reduce((single, { id, alias }) => ({ ...single, [id]: alias }), {});
};

const updateItem = async (itemId: string, details: ItemDetails) => {
  assertValidItemId(itemId);
  assertValidItemDetails(details);
  const originalItem = await cruft.read({ id: itemId });
  const updatedItem: ItemInternal = {
    ...originalItem,
    ...details
  };
  return externalise(await cruft.update(updatedItem));
};

const createItem = async (details: ItemDetails) => {
  assertValidItemDetails(details);

  const item = await cruft.create({
    id: uuid(),
    version: 0,
    ...details
  });

  return externalise(item);
};

export const router: LambdaRouter = lambdaRouter('item', 1);

router.post<ItemDetails, Item>(
  '/',
  async (_key, { }, details) => createItem(details)
);

router.get(
  '/all',
  async (_key) => getAllItems()
);

router.get(
  '/all/aliases',
  async (_key) => getAliases()
);

router.get(
  '/:itemId',
  async (_key, { itemId }) => getItem(itemId)
);

router.post<ItemDetails, Item>(
  '/:itemId',
  async (_key, { itemId }, details) => updateItem(itemId, details)
);

import { config } from 'aws-sdk';
import { default as cruftDDB, IHasMetadata, IHasVersion } from 'cruft-ddb';

import {
  assertOptional,
  assertPositiveInteger,
  assertValidString,
  createAssertValidObject,
  createAssertValidUuid
} from '@honesty-store/service/lib/assert';
import { lambdaRouter, LambdaRouter } from '@honesty-store/service/lib/lambdaRouter';
import { Item, ItemDetails } from './client';

config.region = process.env.AWS_REGION;

type ItemInternal = Item & IHasMetadata & IHasVersion;

const cruft = cruftDDB<ItemInternal>({
  tableName: process.env.TABLE_NAME
});

const assertValidItemId = createAssertValidUuid('itemId');
const assertValidItemDetails = createAssertValidObject<ItemDetails>({
  name: assertValidString,
  qualifier: assertOptional(assertValidString),
  genericName: assertValidString,
  genericNamePlural: assertValidString,
  unit: assertValidString,
  unitPlural: assertValidString,
  location: assertOptional(assertValidString),
  image: assertValidString,
  weight: assertOptional(assertPositiveInteger),
  notes: assertOptional(assertValidString)
});

const externalise = ({ id, name, qualifier, genericName, genericNamePlural, unit, unitPlural, image }: ItemInternal): Item => ({
  id,
  name,
  qualifier,
  genericName,
  genericNamePlural,
  unit,
  unitPlural,
  image
});

const getItem = async(itemId): Promise<Item> => {
  assertValidItemId(itemId);
  return externalise(await cruft.read({ id: itemId }));
};

const getAllItems = async (): Promise<Item[]> => {
  const items = await cruft.__findAll({});
  return items.map(externalise);
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

export const router: LambdaRouter = lambdaRouter('item', 1);

router.get(
  '/all',
  async (_key, {}) => getAllItems()
);

router.get(
  '/:itemId',
  async (_key, { itemId }) => getItem(itemId)
);

router.post<ItemDetails, Item>(
  '/:itemId',
  async (_key, { itemId }, details) => updateItem(itemId, details)
);

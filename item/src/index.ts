import { config } from 'aws-sdk';
import cruftDDB from 'cruft-ddb';

import { createAssertValidUuid } from '@honesty-store/service/lib/assert';
import { lambdaRouter, LambdaRouter } from '@honesty-store/service/lib/lambdaRouter';
import { Item } from './client';

config.region = process.env.AWS_REGION;

const cruft = cruftDDB<Item>({
  tableName: process.env.TABLE_NAME
});

const assertValidItemId = createAssertValidUuid('itemId');

const getItem = async(itemId): Promise<Item> => {
  assertValidItemId(itemId);

  return await cruft.read({ id: itemId });
};

const getAllItems = () => cruft.__findAll({});

export const router: LambdaRouter = lambdaRouter('item', 1);

router.get(
  '/all',
  async (_key, {}) => getAllItems()
);

router.get(
  '/:itemId',
  async (_key, { itemId }) => getItem(itemId)
);

import { CodedError } from '@honesty-store/service/src/error';
import { lambdaRouter } from '@honesty-store/service/src/lambdaRouter';
import { config } from 'aws-sdk';
import cruftDDB from 'cruft-ddb';

import { Store } from './client';

config.region = process.env.AWS_REGION;

const cruft = cruftDDB<Store>({
  tableName: process.env.TABLE_NAME
});

const getStoreFromId = async (id: string) => {
  try {
    return await cruft.read({ id });
  } catch (e) {
    throw new CodedError('StoreNotFound', `No store found with id ${id} - ${e.message}`);
  }
};

const getStoreFromCode = async (code: string) => {
  try {
    return await cruft.find({ code });
  } catch (e) {
    throw new CodedError('StoreNotFound', `No store found with code ${code} - ${e.message}`);
  }
};

export const router = lambdaRouter('store', 1);

router.get(
  '/code/:code',
  async (_key, { code }) => getStoreFromCode(code)
);

router.get(
  '/:id',
  async (_key, { id }) => getStoreFromId(id)
);

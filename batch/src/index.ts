import { config } from 'aws-sdk';
import cruftDDB from 'cruft-ddb';

import { createAssertValidUuid } from '@honesty-store/service/src/assert';
import { lambdaRouter } from '@honesty-store/service/src/lambdaRouter';
import { Batch } from './client';

config.region = process.env.AWS_REGION;

const cruft = cruftDDB<Batch>({
  tableName: process.env.TABLE_NAME
});

const assertValidBatchId = createAssertValidUuid('batchId');

const getBatch = async (batchId): Promise<Batch> => {
  assertValidBatchId(batchId);

  return await cruft.read({ id: batchId });
};

export const router = lambdaRouter('batch', 1);

router.get(
  '/:batchId',
  async (_key, { batchId }) => getBatch(batchId)
);

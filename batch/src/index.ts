import { config } from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import cruftDDB from 'cruft-ddb';
import express = require('express');
import bodyParser = require('body-parser');

import { createAssertValidUuid } from '../../service/src/assert';
import { serviceAuthentication, serviceRouter } from '../../service/src/router';
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

export const app = express();

app.use(bodyParser.json());

const router = serviceRouter('batch', 1);

router.get(
  '/:batchId',
  serviceAuthentication,
  async (_key, { batchId }) => getBatch(batchId)
);

app.use(AWSXRay.express.openSegment('batch'));
app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => void res.sendStatus(200));

app.use(AWSXRay.express.closeSegment());

app.listen(3000);

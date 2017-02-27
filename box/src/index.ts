import { config, DynamoDB } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import isUUID = require('validator/lib/isUUID');

import { serviceAuthentication, serviceRouter } from '../../service/src/router';
import { Box } from './client';

config.region = process.env.AWS_REGION;

const assertValidBoxId = (boxId) => {
  if (boxId == null || !isUUID(boxId, 4)) {
    throw new Error(`Invalid boxId ${boxId}`);
  }
};

const getBox = async (boxId) => {
  assertValidBoxId(boxId);

  const response = await new DynamoDB.DocumentClient()
    .get({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: boxId
      }
    })
    .promise();

  const box = <Box>response.Item;

  if (box == null) {
    throw new Error(`No box for ${boxId}`);
  }

  return box;
};

const assertConnectivity = async () => {
  await new DynamoDB.DocumentClient()
    .get({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: 'non-existent-id'
      }
    })
    .promise();
};

const app = express();

app.use(bodyParser.json());

const router = serviceRouter('box', 1);

router.get(
  '/:boxId',
  serviceAuthentication,
  async (_key, { boxId }) => getBox(boxId)
);

app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => {
  assertConnectivity()
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500));
});

app.listen(3000);

import { config, DynamoDB } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import isUUID = require('validator/lib/isUUID');
import { info } from '../../service/src/log';

import { CodedError } from '../../service/src/error';
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

const updateItems = async ({ box, originalVersion }: { box: Box, originalVersion: number }) => {
  assertValidBoxId(box.id);

  await new DynamoDB.DocumentClient()
    .update({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: box.id
      },
      UpdateExpression:
        'set boxItems = :boxItems, version = :updatedVersion',
      ConditionExpression: 'version=:originalVersion',
      ExpressionAttributeValues: {
        ':originalVersion': originalVersion,
        ':updatedVersion': box.version,
        ':boxItems': box.boxItems
      }
    })
    .promise();
};

const flagOutOfStock = async ({ key, boxId, itemId }) => {
  info(key, `Flagging item out of stock`, { boxId, itemId });

  const box = await getBox(boxId);

  const entry = box.boxItems.find(item => item.itemID === itemId);
  if (!entry) {
    throw new CodedError('ItemNotInBox', `item ${itemId} not found in box ${boxId}`);
  }

  if (!entry.depleted) {
    entry.depleted = Date.now();
    await updateItems({
      box: {
        ...box,
        version: box.version + 1
      },
      originalVersion: box.version
    });
  }

  return {};
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

router.post(
  '/out-of-stock/:boxId/:itemId',
  serviceAuthentication,
  async (key, { boxId, itemId }) => flagOutOfStock({ key, boxId, itemId })
);

app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => {
  assertConnectivity()
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500));
});

app.listen(3000);

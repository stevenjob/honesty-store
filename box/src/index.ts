import { config, DynamoDB } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import isUUID = require('validator/lib/isUUID');
import { v4 as uuid } from 'uuid';
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

const assertValidBatchReference = ({ id, count }) => {
  if (id == null || !isUUID(id, 4)) {
    throw new Error(`Invalid id ${id}`);
  }
  if (!Number.isInteger(count)) {
    throw new Error(`Non-integral count ${count}`);
  }
};

const assertValidBoxItemWithBatchReference = ({ itemID, batches }) => {
  if (itemID == null || !isUUID(itemID, 4)) {
    throw new Error(`Invalid itemID ${itemID}`);
  }
  if (!Array.isArray(batches)) {
    throw new Error(`Invalid batches ${batches}`);
  }
  for (const batchRef of batches) {
    assertValidBatchReference(batchRef);
  }
};

const assertValidBoxSubmission = ({ shippingCost, boxItems, packed, shipped, received, closed }
  : { shippingCost: any, boxItems: any, packed?: any, shipped?: any, received?: any, closed?: any }) => {
  if (!Number.isInteger(shippingCost)) {
    throw new Error(`Non-integral shipping cost ${shippingCost}`);
  }
  if (packed != null && !Number.isInteger(packed)) {
    throw new Error(`Invalid timestamp for packed ${packed}`);
  }
  if (shipped != null && !Number.isInteger(shipped)) {
    throw new Error(`Invalid timestamp for shipped ${shipped}`);
  }
  if (received != null && !Number.isInteger(received)) {
    throw new Error(`Invalid timestamp for received ${received}`);
  }
  if (closed != null && !Number.isInteger(closed)) {
    throw new Error(`Invalid timestamp for closed ${closed}`);
  }
  if (!Array.isArray(boxItems)) {
    throw new Error(`Invalid boxItems ${boxItems}`);
  }
  for (const boxItem of boxItems) {
    assertValidBoxItemWithBatchReference(boxItem);
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

const put = async (box: Box) => {
  assertValidBoxId(box.id);

  await new DynamoDB.DocumentClient()
    .put({
      TableName: process.env.TABLE_NAME,
      Item: box
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

const createBox = async ({ key, boxSubmission }): Promise<Box> => {
  info(key, `Creating new box`, { id: boxSubmission.id });

  assertValidBoxSubmission(boxSubmission);

  // TODO: Calculate per-item costs using batch data

  const box: Box = {
    id: uuid(),
    version: 0,
    ...boxSubmission
  };

  await put(box);

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

router.post(
  '/out-of-stock/:boxId/:itemId',
  serviceAuthentication,
  async (key, { boxId, itemId }) => flagOutOfStock({ key, boxId, itemId })
);

router.post(
  '/',
  serviceAuthentication,
  async (key, {}, boxSubmission) =>
    createBox({ key, boxSubmission })
);

app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => {
  assertConnectivity()
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500));
});

app.listen(3000);

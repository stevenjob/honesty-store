import { config } from 'aws-sdk';
import cruftDDB from 'cruft-ddb';
import express = require('express');
import bodyParser = require('body-parser');
import isUUID = require('validator/lib/isUUID');

import { serviceAuthentication, serviceRouter } from '../../service/src/router';
import { Item } from './client';

config.region = process.env.AWS_REGION;

const cruft = cruftDDB<Item>({
  tableName: process.env.TABLE_NAME
});

const assertValidItemId = (id) => {
  if (!isUUID(id, 4)) {
    throw new Error(`Invalid itemId '${id}'`);
  }
};

const getItem = async(itemId): Promise<Item> => {
  assertValidItemId(itemId);

  return await cruft.read({ id: itemId });
};

const getAllItems = () => cruft.__findAll({});

export const app = express();

app.use(bodyParser.json());

const router = serviceRouter('item', 1);

router.get(
  '/all',
  serviceAuthentication,
  async (_key, {}) => getAllItems()
);

router.get(
  '/:itemId',
  serviceAuthentication,
  async (_key, { itemId }) => getItem(itemId)
);

app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => void res.sendStatus(200));

app.listen(3000);

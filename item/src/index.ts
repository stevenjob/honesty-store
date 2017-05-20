import { config } from 'aws-sdk';
import cruftDDB from 'cruft-ddb';
import express = require('express');
import bodyParser = require('body-parser');

import { createAssertValidUuid } from '@honesty-store/service/src/assert';
import { serviceAuthentication, expressRouter } from '@honesty-store/service/src/router';
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

export const app = express();

app.use(bodyParser.json());

const router = expressRouter('item', 1);

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

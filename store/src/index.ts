import { config } from 'aws-sdk';
import bodyParser = require('body-parser');
import cruftDDB from 'cruft-ddb';
import express = require('express');

import { CodedError } from '../../service/src/error';
import { serviceAuthentication, serviceRouter } from '../../service/src/router';
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

export const app = express();

app.use(bodyParser.json());

const router = serviceRouter('store', 1);

router.get(
  '/code/:code',
  serviceAuthentication,
  async (_key, { code }) => getStoreFromCode(code)
);

router.get(
  '/:id',
  serviceAuthentication,
  async (_key, { id }) => getStoreFromId(id)
);

app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => void res.sendStatus(200));

app.listen(3000);

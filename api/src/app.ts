import * as AWSXRay from 'aws-xray-sdk';
import express = require('express');
import bodyParser = require('body-parser');
import compression = require('compression');
import { serviceRouter } from '@honesty-store/service/src/router';
import cors = require('cors');
import boxController from './controllers/box';
import logoutController from './controllers/logout';
import marketplaceController from './controllers/marketplace';
import purchaseController from './controllers/purchase';
import registerController from './controllers/register';
import sessionController from './controllers/session';
import signInController from './controllers/signin';
import storeController from './controllers/store';
import supportController from './controllers/support';
import surveyController from './controllers/survey';
import topUpController from './controllers/topup';
import transactionsController from './controllers/transactions';
import { apiVersion } from './version';

export const app = express();
const router = serviceRouter('api', apiVersion);

app.use(compression());
app.use(bodyParser.json());
app.use(cors());

app.use(AWSXRay.express.openSegment('api'));

registerController(router);
sessionController(router);
signInController(router);
topUpController(router);
purchaseController(router);
storeController(router);
logoutController(router);
marketplaceController(router);
transactionsController(router);
supportController(router);
surveyController(router);
boxController(router);

app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => {
  res.sendStatus(200);
});

app.use(AWSXRay.express.closeSegment());

app.listen(3000);

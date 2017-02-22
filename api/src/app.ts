import express = require('express');
import bodyParser = require('body-parser');
import compression = require('compression');
import cors = require('cors');
import { serviceRouter } from '../../service/src/router';
import logoutController from './controllers/logout';
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

const app = express();
const router = serviceRouter('api', apiVersion);

app.use(compression());
app.use(bodyParser.json());
app.use(cors());

registerController(router);
sessionController(router);
signInController(router);
topUpController(router);
purchaseController(router);
storeController(router);
logoutController(router);
transactionsController(router);
supportController(router);
surveyController(router);

app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => {
  res.send(200);
});

app.listen(3000);

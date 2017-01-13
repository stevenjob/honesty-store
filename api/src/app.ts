import express = require('express');
import bodyParser = require('body-parser');
import registerController = require('./controllers/register');
import sessionController = require('./controllers/session');
import signInController = require('./controllers/signin');
import topUpController = require('./controllers/topup');
import purchaseController = require('./controllers/purchase');
import storeController = require('./controllers/store');
import logoutController = require('./controllers/logout');
import transactionsController = require('./controllers/transactions');

const app = express();
const router = express.Router();

app.use(bodyParser.json());

registerController(router);
sessionController(router);
signInController(router);
topUpController(router);
purchaseController(router);
storeController(router);
logoutController(router);
transactionsController(router);

app.use('/api/v1', router);

// send healthy response to load balancer probes
app.get('/', (req, res) => {
  res.send(200);
});

app.listen(3000);

const express = require('express');
const bodyParser = require('body-parser');
const registerController = require('./controllers/register');
const sessionController = require('./controllers/session');
const signInController = require('./controllers/signin');
const topUpController = require('./controllers/topup');

const app = express();
const router = express.Router();

app.use(bodyParser.json());

registerController(router);
sessionController(router);
signInController(router);
topUpController(router);

app.use('/api/v1', router);

// send healthy response to load balancer probes
app.get('/', (req, res) => {
  res.send(200);
});

app.listen(3000);

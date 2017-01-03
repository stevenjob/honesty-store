const express = require('express');
const bodyParser = require('body-parser');
const registerController = require('./controllers/register');
const sessionController = require('./controllers/session');

const app = express();
const router = express.Router();

app.use(bodyParser.json());

registerController(router);
sessionController(router);

app.use('/api/v1', router);

app.listen(3000);

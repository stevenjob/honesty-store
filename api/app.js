const express = require('express');
const bodyParser = require('body-parser');
const registerController = require('./controllers/register');

const app = express();
const router = express.Router();

app.use(bodyParser.json());

/** Controller Configuration **/
setupRegisterPhases(router);

// All routes must be prefixed with '/api/v1'
app.use('/api/v1', router);

app.listen(3000);

module.exports = app;

const express = require('express');
const bodyParser = require('body-parser');
const { setupRegisterPhases } = require('./controllers/register');

const app = express();
const router = express.Router();

app.use(bodyParser.json());

/** Controller Configuration **/
setupRegisterPhases(router);

/** Routes **/

// All routes must be prefixed with '/api/v1'
app.use('/api/v1', router);

/** Port Listening **/
app.listen(3000, () => {
  console.log('Honesty store API app is listening on port 3000');
});

module.exports = app;

import express = require('express');

const app = express();

app.get('/topup', (req, res) => {
  res.sendStatus(200);
});

app.listen(3000);

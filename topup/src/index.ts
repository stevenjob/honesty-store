import express = require('express');

const app = express();

// send healthy response to load balancer probes
app.get('/', (req, res) => {
    res.sendStatus(200);
});

app.get('/topup', (req, res) => {
  res.sendStatus(200);
});

app.listen(3000);

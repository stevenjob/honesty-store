const express = require('express');
const path = require('path');
const expressLogging = require('express-logging');
const logger = require('logops');
const port = process.env.PORT || 8080;
const app = express();

// Upgrade HTTP connections to HTTPS automatically
// (ignore non-proxied requests i.e. LB probes)
app.use((req, res, next) => {
  if (req.get('X-Forwarded-Proto') === 'http') {
    return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
  } else {
    return next();
  }
});

app.use(expressLogging(logger));

// Needs to be served with this exact url but with JSON
app.use(
  '/.well-known/apple-app-site-association',
  express.static(
    __dirname + '/build/.well-known/apple-app-site-association',
    { setHeaders: (res) => res.type('json'), }
  )
);

// serve static assets normally
app.use(
  express.static(
    __dirname + '/build',
    { maxAge: '1y' }
  )
);

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

app.listen(port);
console.log("server started on port " + port);
const express = require('express');
const compression = require('compression');
const path = require('path');
const expressLogging = require('express-logging');
const logger = require('logops');
const cors = require('cors');
const port = process.env.PORT || 8080;
const app = express();

exports.app = app;

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
app.use(compression());
app.use(cors());

// Needs to be served with this exact url but with JSON
app.use(
  '/.well-known/apple-app-site-association',
  express.static(
    path.resolve(__dirname, '..', 'build', '.well-known', 'apple-app-site-association'),
    {
      setHeaders: (res) => res.type('json'),
      etag: false
    }
  )
);

// serve versioned static assets with 1Y cache
app.use(
  '/static',
  express.static(
    path.resolve(__dirname, '..', 'build', 'static'),
    { maxAge: '1y' }
  )
);

// serve unversioned static assets without cache
app.use(
  express.static(
    path.resolve(__dirname, '..', 'build'),
    { etag: false }
  )
);

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('*', (request, response) => {
  response.sendFile(
    path.resolve(__dirname, '..', 'build', 'index.html'),
    { etag: false }
  );
});

app.listen(port);
console.log("server started on port " + port);

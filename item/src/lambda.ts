import awsServerlessExpress = require('aws-serverless-express');
import { app } from './index';

const server = awsServerlessExpress.createServer(
  app,
  null,
  [
    'application/font-woff',
    'application/font-woff2',
    'application/javascript',
    'application/json',
    'application/octet-stream',
    'application/xml',
    'font/eot',
    'font/opentype',
    'font/otf',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/x-icon',
    'text/comma-separated-values',
    'text/css',
    'text/html',
    'text/javascript',
    'text/plain',
    'text/text',
    'text/xml',
    '*/*'
  ]);

exports.handler = (event, context) =>
  awsServerlessExpress.proxy(server, event, context);

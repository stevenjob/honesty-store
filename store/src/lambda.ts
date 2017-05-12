import awsServerlessExpress = require('aws-serverless-express');
import { app } from './index';

const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) =>
  awsServerlessExpress.proxy(server, event, context);

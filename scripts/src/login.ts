#!/usr/local/bin/node

import jwt = require('jsonwebtoken');

const cmd = process.argv[1];
const args = process.argv.slice(2);

const usage = () => {
  console.error(`Usage: ${cmd} user-id refresh-token user-secret`);
  process.exit(2);
};

if (args.length !== 3) {
  usage();
}

const userId = args.shift();
const refreshToken = args.shift();
const userSecret = args.shift();
const expiresIn = '5 minutes';

// tslint:disable-next-line:no-console
console.log(jwt.sign({ userId, refreshToken }, userSecret, { algorithm: 'HS256', expiresIn }));

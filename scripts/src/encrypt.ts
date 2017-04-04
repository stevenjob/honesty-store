#!/usr/local/bin/node

import jwt = require('jsonwebtoken');

const cmd = process.argv[1];
const args = process.argv.slice(2);

const usage = () => {
  console.error(`Usage: ${cmd} [--expires-in time] secret json`);
  console.error(`  e.g. 'service:interservice-auth' '{ "baseUrl": "..." }'`);
  process.exit(2);
};

let expiresIn = '5 minutes';

if (args[0] === '--expires-in') {
  args.shift();
  if (args.length === 0) {
    usage();
  }

  expiresIn = args.shift();
}

if(args.length !== 2){
  usage();
}

const secret = args.shift();
const jsonStr = args.shift();
const json = JSON.parse(jsonStr);

console.log(jwt.sign(json, secret, { algorithm: 'HS256', expiresIn }));

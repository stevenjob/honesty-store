#!/usr/bin/env node

import jwt = require('jsonwebtoken');
import { createTransaction } from '../../transaction/src/client';
import { getUser } from '../../user/src/client';
import { createUserKey } from '../../service/src/key';

const usage = () => {
  const script = process.argv[1];
  const [, filename = script] = script.match(/\/([^/]+)$/);

  console.error(`Usage: ${filename} userId amount`);
  console.error(`  $SERVICE_TOKEN_SECRET and $BASE_URL required in the environment`);
  console.error(``);
  console.error(`  e.g. SERVICE_TOKEN_SECRET=service:xNxznoraYHUq+A0O33OJ23pwwfQAtK12SCt BASE_URL=https://honesty.store ${filename} 56b60280-5823-4058-9b5b-24f4c2660876 500`);
  process.exit(2);
}

const main = async (args) => {
  if (args.length !== 2) {
    usage();
  }

  const [ userId, amountArgument ] = args;

  const amount = Number(amountArgument);

  const correlationKey = createUserKey({ userId });

  const user = await getUser(correlationKey, userId);

  const supportTopupTx = await createTransaction(
    correlationKey,
    user.accountId,
    {
      type: 'topup',
      amount,
      data: {
        isSupportTopup: 'true', // must be a string
      }
    });
};

main(process.argv.slice(2))
  .then(() => void 0)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

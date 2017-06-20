#!/usr/bin/env node

import { createUserKey } from '@honesty-store/service/lib/key';
import { createTransaction, transactionTypes } from '@honesty-store/transaction';
import { getUser } from '@honesty-store/user';

const usage = () => {
  const script = process.argv[1];
  const [, filename = script] = script.match(/\/([^/]+)$/);

  console.error(`Usage: ${filename} userId type amount extra-json-data`);
  console.error(`  type should be one of ${transactionTypes.join(', ')}`);
  console.error(``);
  console.error(`  $SERVICE_TOKEN_SECRET and $BASE_URL required in the environment`);
  console.error(`  $BASE_URL should be https://live.honesty.store for real topups, avoiding the https://honesty.store CDN`);
  console.error(``);
  // tslint:disable-next-line:max-line-length
  console.error(`  e.g. SERVICE_TOKEN_SECRET=... BASE_URL=... ${filename} 56b60280-5823-4058-9b5b-24f4c2660876 credit 500 '{ "scottcoinTx": "<scottcoin-block-hash>" }'`);
  process.exit(2);
};

const main = async (args) => {
  if (args.length !== 4) {
    usage();
  }

  const [ userId, type, amountArgument, jsonArgument ] = args;

  const amount = Number(amountArgument);
  const json = JSON.parse(jsonArgument);

  const correlationKey = createUserKey({ userId });

  const user = await getUser(correlationKey, userId);

  const supportTopupTx = await createTransaction(
    correlationKey,
    user.accountId,
    {
      type,
      amount,
      data: json
    });
  // tslint:disable-next-line:no-console
  console.log(`topup transaction: ${JSON.stringify(supportTopupTx)}`);
};

main(process.argv.slice(2))
  .then(() => void 0)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

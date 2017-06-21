#!/usr/bin/env node

import * as program from 'commander';

import { createUserKey } from '@honesty-store/service/lib/key';
import { createTransaction } from '@honesty-store/transaction';
import { getUser } from '@honesty-store/user';

import { createServiceKey } from '@honesty-store/service/lib/key';
import { issueSupportRequestedRefund } from '@honesty-store/transaction';

const issueRefund = async (transactionId, reason, dateLimit) => {
  const key = createServiceKey({ service: 'refund-script' });
  const response = await issueSupportRequestedRefund(key, transactionId, reason, dateLimit);

  // tslint:disable-next-line:no-console
  console.log(JSON.stringify(response, null, 2));
};

const issue = async (type, userId, amountArgument, jsonArgument) => {
  const amount = Number(amountArgument);
  const json = JSON.parse(jsonArgument);

  const correlationKey = createUserKey({ userId });

  const user = await getUser(correlationKey, userId);

  const tx = await createTransaction(
    correlationKey,
    user.accountId,
    {
      type,
      amount,
      data: json
    });

  // tslint:disable-next-line:no-console
  console.log(JSON.stringify(tx));
};

const issueDebit = async (userId, amountArgument, jsonArgument) => issue('debit', userId, amountArgument, jsonArgument);
const issueCredit = async (userId, amountArgument, jsonArgument) => issue('credit', userId, amountArgument, jsonArgument);

const errorWrap = asyncFunc => (...args) => {
  asyncFunc(...args)
    .catch(e => {
      console.error(e.message);
      process.exit(1);
    });
};

program.command('issue [transactionId] [reason] [dateLimit]')
  .description('issues a refund of the given transactionId')
  .action(errorWrap(issueRefund));

program.command('credit [userId] [amount] [extra-json-data]')
  .description('issues a credit')
  .action(errorWrap(issueCredit));

program.command('debit [userId] [amount] [extra-json-data]')
  .description('issues a debit')
  .action(errorWrap(issueDebit));

program.command('*')
  .action(() => {
    program.help();
    process.exit(2);
  });

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
  process.exit(2);
}

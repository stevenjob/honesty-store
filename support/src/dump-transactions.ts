#!/usr/bin/env node

import cruftDDB from 'cruft-ddb';
import { Account } from '../../transaction/src/client/index';
import { User } from '../../user/src/client/index';
import { getItem } from '../../api/src/services/item';
import { stringify } from 'csv';

const cruftAccount = cruftDDB<Account>({ tableName: 'honesty-store-transaction' });
const cruftUser = cruftDDB<User>({ tableName: 'honesty-store-user' });

const usage = () => {
  const script = process.argv[1];
  const [, filename = script] = script.match(/\/([^/]+)$/);

  console.error(`Usage: ${filename}`);
  console.error(`  Dumps a csv of all transaction metadata`);
  process.exit(2);
};

const main = async (args) => {
  if (args.length !== 0) {
    usage();
  }

  const registeredUsers = (await cruftUser.__findAll({}))
    .filter(user => user.emailAddress != null);

  const transactions = (await cruftAccount.__findAll({}))
    .map((account) => {
      const user = registeredUsers.find((user) => user.accountId === account.id);
      if (user == null) {
        return [];
      }
      const { id: userId, ...userDetails } = user;
      const { id: accountId, transactions, ...accountDetails } = account;
      return transactions.map((transaction) => {
        const { id: transactionId, data, ...transactionDetails } = transaction;
        const itemDetails = data.itemId ? getItem(data.itemId) : {};
        return {
          userId,
          ...userDetails,
          accountId,
          ...accountDetails,
          transactionId,
          ...transactionDetails,
          ...data,
          ...itemDetails
        };
      }
      )
    })
    .reduce((a, b) => a.concat(b))
    .map((item) => {
      const excelDate = (timestamp) => (timestamp + 2209161600000) / (24 * 60 * 60 * 1000);
      item.timestamp = excelDate(item.timestamp);
      item.created = excelDate(item.timestamp)
      return item;
    });

  // tslint:disable-next-line:no-console
  stringify(transactions, { header: true })
    .pipe(process.stdout);
};

main(process.argv.slice(2))
  .then(() => void 0)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

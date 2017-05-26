#!/usr/bin/env node

import cruftDDB from 'cruft-ddb';
import { stringify } from 'csv';

import { getAllItems } from '@honesty-store/item/src/client';
import { createServiceKey } from '@honesty-store/service/src/key';
import { Store } from '@honesty-store/store/src/client/index';
import { InternalAccount, InternalTransaction } from '@honesty-store/transaction/src/client/index';
import { User } from '@honesty-store/user/src/client/index';

type TransactionRecord = InternalAccount | InternalTransaction;

const cruftAccount = cruftDDB<TransactionRecord>({ tableName: 'honesty-store-transaction' });
const cruftUser = cruftDDB<User>({ tableName: 'honesty-store-user' });
const cruftStore = cruftDDB<Store>({ tableName: 'honesty-store-store' });

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

  const stores = await cruftStore.__findAll({});
  const ensureIsStoreCode = codeOrId => stores
    .find(({ code, id }) => id === codeOrId || code === codeOrId)
    .code;

  const registeredUsers = (await cruftUser.__findAll({}))
    .filter(user => user.emailAddress != null);

  const allAccountsAndTransactions = await cruftAccount.__findAll({});

  const allTransactions = allAccountsAndTransactions
    // tslint:disable-next-line:triple-equals
    .filter(account => (account as InternalAccount).balance == undefined) as InternalTransaction[];

  const allAccounts = allAccountsAndTransactions
    // tslint:disable-next-line:triple-equals
    .filter(account => (account as InternalAccount).balance != undefined) as InternalAccount[];

  const getLinkedTransactions = (transactionHead) => {
    if (!transactionHead) {
      return [];
    }

    const head = allTransactions.find(({ id }) => id === transactionHead);
    if (!head) {
      throw new Error(`Couldn't find transaction '${transactionHead}'`);
    }

    return [
      head,
      ...getLinkedTransactions(head.next)
    ];
  };

  const items = await getAllItems(createServiceKey({ service: 'dump-transactions' }));

  const userTransactions = allAccounts
    .map(account => {
      const user = registeredUsers.find(({ accountId }) => accountId === account.id);
      if (user == null) {
        return [];
      }
      const { id: userId, ...userDetails } = user;
      // tslint:disable-next-line:no-unused-variable
      const { id: accountId, transactionHead, cachedTransactions, ...accountDetails } = account;

      const transactions = getLinkedTransactions(transactionHead);

      return transactions.map((transaction) => {
        // tslint:disable-next-line:no-unused-variable
        const { id: transactionId, data, next, ...transactionDetails } = transaction;
        const itemDetails = data.itemId ? items.find(({ id }) => id === data.itemId) : {};
        return {
          userId,
          ...userDetails,
          accountId,
          ...accountDetails,
          transactionId,
          ...transactionDetails,
          ...data,
          storeCode: data.storeId && ensureIsStoreCode(data.storeId),
          ...itemDetails
        };
      }
      );
    })
    .reduce((a, b) => a.concat(b))
    .map((item) => {
      const excelDate = (timestamp) => (Number(timestamp) + 2209161600000) / (24 * 60 * 60 * 1000);
      item.timestamp = excelDate(item.timestamp);
      item.created = excelDate(item.timestamp);
      return item;
    });

  // tslint:disable-next-line:no-console
  stringify(userTransactions, { header: true })
    .pipe(process.stdout);
};

main(process.argv.slice(2))
  .then(() => void 0)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

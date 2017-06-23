import { stringify as csvStringifyCb } from 'csv';

import cruftDDB from '@honesty-store/cruft/lib/index';
import { getItem } from '@honesty-store/item';
import { createServiceKey } from '@honesty-store/service/lib/key';
import { sendSlackMessageOneLine } from '@honesty-store/service/lib/slack';
import { getStoreFromId } from '@honesty-store/store';
import { Transaction } from '@honesty-store/transaction';
import { subscribeTransactions } from '@honesty-store/transaction/lib/client/stream';
import { getUser } from '@honesty-store/user';

interface CSVRow {
  emoji: string;
  type: string;
  emailAddress: string;
  itemDescription: string;
  storeCode: string;
  price: number;
  shortTxId: string;
  comment: string;
}

interface SimplifiedTransaction {
  id: string;
  version: number;
  type: 'refund' | 'purchase';
}

const cruft = cruftDDB<SimplifiedTransaction>({
  tableName: process.env.TABLE_NAME,
  limit: 100
});

const csvStringify = (objects, options) =>
  new Promise((resolve, reject) =>
    csvStringifyCb(objects, options, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    }));

const getCommonItemTransactionDetails = async (key, { id: transactionId, data: { itemId, storeId, userId }, amount }: Transaction) => {
  const [user, item, store] = await Promise.all([
    getUser(key, userId),
    getItem(key, itemId),
    getStoreFromId(key, storeId)
  ]);
  const shortTxId = transactionId.replace(/^(.{5}).*:(.{5}).*/, '$1:$2');

  return {
    emailAddress: user.emailAddress,
    itemDescription: item.name + (item.qualifier ? ` ${item.qualifier}` : ''),
    storeCode: store.code,
    price: Math.abs(amount),
    shortTxId
  };
};

const sendSlackRefundMessage = async (key, transaction: Transaction) => {
  const commonDetails = await getCommonItemTransactionDetails(key, transaction);
  const { data: { reason: comment } } = transaction;

  const message = {
    emoji: ':money_with_wings:',
    type: 'refund',
    ...commonDetails,
    comment
  };

  await sendTransactionNotification(key, message);
};

const sendSlackPurchaseMessage = async (key, transaction: Transaction) => {
  const commonDetails = await getCommonItemTransactionDetails(key, transaction);

  const message = {
    emoji: ':moneybag:',
    type: 'purchase',
    ...commonDetails,
    comment: ''
  };
  await sendTransactionNotification(key, message);
};

const sendTransactionNotification = async (key, message: CSVRow) => {
  const csvMessage = await csvStringify(
    [message],
    { header: false }
  );
  await sendSlackMessageOneLine({
    key,
    message: csvMessage,
    channel: 'purchases'
  });
};

const asyncHandler = async dynamoEvent => {
  const key = createServiceKey({ service: 'transaction-slack' });

  const reduce = cruft.reduce<SimplifiedTransaction>(
    event => event.type,
    event => event.id,
    (aggregate, _event, _emit) => aggregate);

  for (const transaction of subscribeTransactions(dynamoEvent)) {
    if (transaction.type !== 'purchase' && transaction.type !== 'refund') {
      continue
    }

    const simplifiedTx = {
      id: transaction.id,
      type: transaction.type,
      version: 0
    };
    const { eventStored } = await reduce(simplifiedTx);
    if (!eventStored) {
      continue;
    }

    switch (transaction.type) {
      case 'purchase':
        await sendSlackPurchaseMessage(key, transaction);
        break;
      case 'refund':
        await sendSlackRefundMessage(key, transaction);
        break;
      default:
        break;
    }
  }

  return `Successfully processed ${dynamoEvent.Records.length} records`;
};

export const handler = (event, context) =>
  asyncHandler(event)
    .then(info => context.succeed(info))
    .catch(e => context.fail(e));

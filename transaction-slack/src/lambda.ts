import { stringify as csvStringifyCb } from 'csv';

import { getItem } from '@honesty-store/item';
import { createServiceKey } from '@honesty-store/service/lib/key';
import { sendSlackMessageOneLine } from '@honesty-store/service/lib/slack';
import { getStoreFromId } from '@honesty-store/store';
import { Transaction } from '@honesty-store/transaction';
import { subscribeTransactions } from '@honesty-store/transaction/lib/client/stream';
import { getUser } from '@honesty-store/user';

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
    store: store.code,
    price: Math.abs(amount),
    shortTxId
  };
};

const recordRefund = async (key, transaction: Transaction) => {
  const commonDetails = await getCommonItemTransactionDetails(key, transaction);
  const { data: { reason } } = transaction;

  const csvMessage = await csvStringify(
    [{
      type: ':money_with_wings: (refund)',
      reason,
      ...commonDetails
    }],
    {
      header: false
    });

  await sendSlackMessageOneLine({
    key,
    message: csvMessage,
    channel: 'purchases'
  });
};

const recordPurchase = async (key, transaction: Transaction) => {
  const commonDetails = await getCommonItemTransactionDetails(key, transaction);

  const csvMessage = await csvStringify(
    [{
      type: ':moneybag: (purchase)',
      ...commonDetails
    }],
    {
      header: false
    });

  await sendSlackMessageOneLine({
    key,
    message: csvMessage,
    channel: 'purchases'
  });
};

const asyncHandler = async event => {
  const key = createServiceKey({ service: 'transaction-slack' });

  for (const transaction of subscribeTransactions(event)) {
    switch (transaction.type) {
      case 'purchase':
        await recordPurchase(key, transaction);
        break;
      case 'refund':
        await recordRefund(key, transaction);
        break;
      default:
        break;
    }
  }

  return `Successfully processed ${event.Records.length} records`;
};

export const handler = (event, context) =>
  asyncHandler(event)
    .then(info => context.succeed(info))
    .catch(e => context.fail(e));

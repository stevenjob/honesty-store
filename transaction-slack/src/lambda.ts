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

const recordPurchase = async (key, { id: transactionId, data: { userId, itemId, storeId }, amount }: Transaction) => {
  const user = await getUser(key, userId);
  const item = await getItem(key, itemId);
  const store = await getStoreFromId(key, storeId);
  const shortTxId = transactionId.replace(/^(.{5}).*:(.{5}).*/, '$1:$2');

  const csvMessage = await csvStringify(
    [{
      emailAddress: user.emailAddress,
      itemDescription: item.name + (item.qualifier ? ` ${item.qualifier}` : ''),
      store: store.code,
      price: -amount,
      shortTxId
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
    if (transaction.type !== 'purchase') {
      continue;
    }

    await recordPurchase(key, transaction);
  }

  return `Successfully processed ${event.Records.length} records`;
};

export const handler = (event, context) =>
  asyncHandler(event)
    .then(info => context.succeed(info))
    .catch(e => context.fail(e));

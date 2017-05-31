import { stringify as csvStringifyCb } from 'csv';

import { getItem } from '@honesty-store/item/src/client';
import { createServiceKey } from '@honesty-store/service/src/key';
import { sendSlackMessageOneLine } from '@honesty-store/service/src/slack';
import { getStoreFromId } from '@honesty-store/store/src/client';
import { Transaction } from '@honesty-store/transaction/src/client';
import { subscribeTransactions } from '@honesty-store/transaction/src/client/stream';
import { getUser } from '@honesty-store/user/src/client';

const csvStringify = (objects, options) =>
  new Promise((resolve, reject) =>
    csvStringifyCb(objects, options, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    }));

const recordPurchase = async (key, { id: transactionId, type, data: { userId, itemId, storeId }, amount }: Transaction) => {
  if (type !== 'purchase') {
    return;
  }

  const user = await getUser(key, userId);
  const item = await getItem(key, itemId);
  const store = await getStoreFromId(key, storeId);
  const shortTxId = transactionId.replace(/^(.{5}).*:(.{5}).*/, '$1:$2');

  const csvMessage = await csvStringify(
    [{
      emailAddress: user.emailAddress,
      itemDescription: `${item.name} ${item.qualifier}`,
      store: store.code,
      price: -amount,
      shortTxId
    }],
    {
      header: false
    });

  await sendSlackMessageOneLine({
    key,
    // tslint:disable-next-line:max-line-length
    message: csvMessage,
    channel: 'purchases'
  });
};

const asyncHandler = async event => {
  const key = createServiceKey({ service: 'transaction-slack' });

  for (const transaction of subscribeTransactions(event)) {
    await recordPurchase(key, transaction);
  }

  return `Successfully processed ${event.Records.length} records`;
};

export const handler = (event, context) =>
  asyncHandler(event)
    .then(info => context.succeed(info))
    .catch(e => context.fail(e));

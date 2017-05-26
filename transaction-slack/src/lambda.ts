import { createServiceKey } from '@honesty-store/service/src/key';
import { sendSlackMessage } from '@honesty-store/service/src/slack';
import { subscribeTransactions } from '@honesty-store/transaction/src/client/stream';
import { Transaction } from '@honesty-store/transaction/src/client';

const recordPurchase = async (key, { itemId, storeId, transactionId }) => {
  await sendSlackMessage({
    key,
    message: `Purchase landed: item ${itemId} store ${storeId} transaction ${transactionId}`,
    channel: 'purchases',
    fields: [
      {
        title: 'itemId',
        value: itemId
      },
      {
        title: 'storeId',
        value: storeId
      },
      {
        title: 'transactionId',
        value: transactionId
      }
    ]
  });
};

const recordStockDrop = async (key, { id: transactionId, type, data: { itemId, storeId } }: Transaction) => {
  if (type !== 'purchase') {
    return;
  }

  await recordPurchase(key, { itemId, storeId, transactionId });
};

const asyncHandler = async event => {
  const key = createServiceKey({ service: 'transaction-slack' });

  for (const transaction of subscribeTransactions(event)) {
    await recordStockDrop(key, transaction);
  }

  return `Successfully processed ${event.Records.length} records`;
};

export const handler = (event, context) =>
  asyncHandler(event)
    .then(info => context.succeed(info))
    .catch(e => context.fail(e));

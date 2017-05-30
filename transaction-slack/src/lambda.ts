import { getItem } from '@honesty-store/item/src/client';
import { createServiceKey } from '@honesty-store/service/src/key';
import { sendSlackMessageOneLine } from '@honesty-store/service/src/slack';
import { getStoreFromId } from '@honesty-store/store/src/client';
import { Transaction } from '@honesty-store/transaction/src/client';
import { subscribeTransactions } from '@honesty-store/transaction/src/client/stream';
import { getUser } from '@honesty-store/user/src/client';

const recordPurchase = async (key, { type, data: { userId, itemId, storeId } }: Transaction) => {
  if (type !== 'purchase') {
    return;
  }

  const user = await getUser(key, userId);
  const item = await getItem(key, itemId);
  const store = await getStoreFromId(key, storeId);

  await sendSlackMessageOneLine({
    key,
    message: `${user.emailAddress} bought "${item.name}" from ${store.code}`,
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

import { createServiceKey } from '@honesty-store/service/src/key';
import { recordTransaction } from '@honesty-store/store/src/client';
import { subscribeTransactions } from '@honesty-store/transaction/src/client/stream';

const asyncHandler = async event => {
  const key = createServiceKey({ service: 'transaction-slack' });

  for (const transaction of subscribeTransactions(event)) {
    if (transaction.type === 'topup') {
      continue;
    }
    await recordTransaction(key, transaction);
  }

  return `Successfully processed ${event.Records.length} records`;
};

export const handler = (event, context) =>
  asyncHandler(event)
    .then(info => context.succeed(info))
    .catch(e => context.fail(e));

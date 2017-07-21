import { createServiceKey } from '@honesty-store/service/lib/key';
import { recordTransaction } from '@honesty-store/topup';
import { subscribeTransactionsAndBalances } from '@honesty-store/transaction/lib/client/stream';

const asyncHandler = async event => {
  const key = createServiceKey({ service: 'transaction-topup' });

  for (const transaction of subscribeTransactionsAndBalances(event)) {
    await recordTransaction(key, transaction);
  }

  return `Successfully processed ${event.Records.length} records`;
};

export const handler = (event, context) =>
  asyncHandler(event)
    .then(info => context.succeed(info))
    .catch(e => context.fail(e));

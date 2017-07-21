import { createServiceKey } from '@honesty-store/service/lib/key';
import { subscribeTopups } from '@honesty-store/topup/lib/client/stream';
import { recordTopup } from '@honesty-store/transaction';

const asyncHandler = async event => {
  const key = createServiceKey({ service: 'transaction-store' });

  for (const topupAccount of subscribeTopups(event)) {
    if (topupAccount.status == null || topupAccount.status.status !== 'in-progress') {
      return;
    }
    await recordTopup(key, topupAccount.id, topupAccount.status.chargeId, {
      type: 'topup',
      amount: topupAccount.status.amount,
      data: {
        stripeFee: String(topupAccount.status.stripeFee),
        chargeId: topupAccount.status.chargeId
      }
    });
  }

  return `Successfully processed ${event.Records.length} records`;
};

export const handler = (event, context) =>
  asyncHandler(event)
    .then(info => context.succeed(info))
    .catch(e => context.fail(e));

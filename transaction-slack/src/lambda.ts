import 'aws-sdk'; // imported for side-effects to allow the below to work
import * as DynamoConverter from 'aws-sdk/lib/dynamodb/converter';

import { createServiceKey } from '@honesty-store/service/src/key';
import { sendSlackMessage } from '@honesty-store/service/src/slack';

const dynamoOutputConverter = (<any>DynamoConverter).output;

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

const recordStockDrop = async (key, record) => {
  const entry = dynamoOutputConverter({ M: record.dynamodb.NewImage });

  let transactionId;
  let type;
  let itemId;
  let storeId;
  try {
    ({ id: transactionId, type, data: { itemId, storeId } } = entry);
  } catch (e) {
    if (!(e instanceof TypeError)) {
      throw e;
    }

    // transaction's missing fields, ignore
    return;
  }

  if (type !== 'purchase') {
    return;
  }

  await recordPurchase(key, { itemId, storeId, transactionId });
};

const asyncHandler = async event => {
  const key = createServiceKey({ service: 'transaction-slack' });

  const promises = event.Records.map(record => recordStockDrop(key, record));

  await Promise.all(promises);

  return `Successfully processed ${event.Records.length} records`;
};

export const handler = (event, context) =>
  asyncHandler(event)
    .then(info => context.succeed(info))
    .catch(e => context.fail(e));

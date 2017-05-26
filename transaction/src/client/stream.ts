import 'aws-sdk'; // imported for side-effects to allow the below to work
import * as DynamoConverter from 'aws-sdk/lib/dynamodb/converter';

import { Transaction } from './';

const dynamoOutputConverter = (<any>DynamoConverter).output;

export const isTransaction = type => type === 'topup' || type === 'purchase';

export const subscribeTransactions = function* (event) {
  for (const record of event.Records) {
    const converted = dynamoOutputConverter({ M: record.dynamodb.NewImage });

    switch (converted.type) {
      case 'topup':
      case 'purchase':
        yield <Transaction>converted;
        break;

      default:
        // an account
        break;
    }
  }
};

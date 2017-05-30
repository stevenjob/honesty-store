import { DynamoDB } from 'aws-sdk';
import { Transaction } from './';

export const isTransaction = type => type === 'topup' || type === 'purchase';

export const subscribeTransactions = function* (event) {
  for (const record of event.Records) {
    const converted = DynamoDB.Converter.output({ M: record.dynamodb.NewImage });

    if (isTransaction(converted.type)) {
      yield <Transaction>converted;
    }
  }
};

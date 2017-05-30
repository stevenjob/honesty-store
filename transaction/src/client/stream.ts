import { DynamoDB } from 'aws-sdk';
import { Transaction, TransactionType } from './';

const isTransaction = (type: TransactionType) => type === 'topup' || type === 'purchase';

export const subscribeTransactions = function* (event) {
  for (const record of event.Records) {
    const converted = DynamoDB.Converter.output({ M: record.dynamodb.NewImage });

    if (isTransaction(converted.type)) {
      yield <Transaction>converted;
    }
  }
};

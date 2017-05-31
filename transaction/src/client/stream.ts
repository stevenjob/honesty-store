import { DynamoDB } from 'aws-sdk';
import { Transaction, transactionTypes } from './';

const isTransaction = (transaction: any): transaction is Transaction => {
  const { type } = transaction;
  return transactionTypes.some(txType => txType === type);
};

export const subscribeTransactions = function* (event): IterableIterator<Transaction> {
  for (const record of event.Records) {
    const converted = DynamoDB.Converter.output({ M: record.dynamodb.NewImage });

    if (isTransaction(converted)) {
      yield converted;
    }
  }
};

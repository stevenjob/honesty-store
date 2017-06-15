import { DynamoDB } from 'aws-sdk';
import { InternalAccount, Transaction } from './';

const isAccount = (account: any): account is InternalAccount =>
  account.balance != null;

export const subscribeTransactions = function* (event): IterableIterator<Transaction> {
  for (const record of event.Records) {
    const image = DynamoDB.Converter.output({ M: record.dynamodb.NewImage });

    if (isAccount(image)) {
      yield image.cachedTransactions[0]; // may generate spurious transactions, but reducers will handle this
    }
  }
};

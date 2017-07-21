import { DynamoDB } from 'aws-sdk';
import { InternalAccount, Transaction, TransactionAndBalance } from './';

const isAccount = (account: any): account is InternalAccount =>
  account.balance != null;

export const subscribeTransactionsAndBalances = function* (event): IterableIterator<TransactionAndBalance> {
  for (const record of event.Records) {
    const image = DynamoDB.Converter.output({ M: record.dynamodb.NewImage });

    if (isAccount(image) && image.cachedTransactions.length > 0) {
      const { balance, cachedTransactions } = image;
      // may generate spurious transactions, but reducers will handle this
      yield {
        balance,
        transaction: cachedTransactions[0]
      };
    }
  }
};

export const subscribeTransactions = function* (event): IterableIterator<Transaction> {
  for (const record of subscribeTransactionsAndBalances(event)) {
    const { transaction } = record;
    yield transaction;
  }
};

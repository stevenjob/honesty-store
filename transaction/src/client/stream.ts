import { DynamoDB } from 'aws-sdk';
import { InternalAccount, Transaction } from './';

const isAccount = (account: any): account is InternalAccount =>
  account.balance != null;

const hasNewTransaction = ({ transactionHead: oldTxHead }: InternalAccount, { transactionHead: newTxHead }: InternalAccount) =>
  oldTxHead !== newTxHead;

export const subscribeTransactions = function* (event): IterableIterator<Transaction> {
  for (const record of event.Records) {
    const oldImage = DynamoDB.Converter.output({ M: record.dynamodb.OldImage });
    const newImage = DynamoDB.Converter.output({ M: record.dynamodb.NewImage });

    if (isAccount(oldImage) && isAccount(newImage) && hasNewTransaction(oldImage, newImage)) {
      yield newImage.cachedTransactions[0];
    }
  }
};

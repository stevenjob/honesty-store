import { DynamoDB } from 'aws-sdk';
import { TopupAccount } from './';

const isTopupAccount = (account: any): account is TopupAccount =>
  account.test != null && account.userId != null;

export const subscribeTopups = function* (event): IterableIterator<TopupAccount> {
  for (const record of event.Records) {
    const image = DynamoDB.Converter.output({ M: record.dynamodb.NewImage });

    if (isTopupAccount(image) && image.status != null) {
      // may generate spurious updates, but reducers will handle this
      yield image;
    }
  }
};

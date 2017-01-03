import { IAM, config } from 'aws-sdk';

export const getAccountId = async () => {
  const response = await new IAM({ apiVersion: '2010-05-08' })
    .getUser()
    .promise();
  const [arn, partition, service, region, accountId] = response.User.Arn.split(':');
  return accountId;
};
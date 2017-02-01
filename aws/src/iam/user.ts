import { IAM } from 'aws-sdk';

export const getAccountId = async () => {
  const response = await new IAM({ apiVersion: '2010-05-08' })
    .getUser()
    .promise();
  const splitArn = response.User.Arn.split(':');
  return splitArn[splitArn.length - 1];
};

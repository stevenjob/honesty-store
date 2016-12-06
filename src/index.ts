/*
Work in progress, trying to emulate the after_success section of
https://gist.github.com/BretFisher/14cd228f0d7e40dae085
in Node.js rather than shell.

Hoping to ultimately use it to automagically deploy the web repo's PRs to ECS.
*/

import { config, ECR, IAM } from 'aws-sdk';
import { execSync } from 'child_process';

config.credentials = {
  accessKeyId: "AKIAIBP2ZVIV4UKIWZQQ",
  secretAccessKey: "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"
};
config.region = "eu-west-1";

const getAccountId = async () => {
  const response = await new IAM({ apiVersion: '2010-05-08' })
    .getUser()
    .promise();
  const [ arn, partition, service, region, accountId ] = response.User.Arn.split(':');
  return accountId;
}

const getCredentials = async () => {
  const response = await new ECR({ apiVersion: '2015-09-21' })
    .getAuthorizationToken()
    .promise();
  const token = response.authorizationData[0].authorizationToken;
  const decodedToken = Buffer.from(token, 'base64').toString('utf8');
  const [ user, password ] = decodedToken.split(':');
  return { user, password };
};

const dockerLogin = async () => {
  const [accountId, { user, password }] = await Promise.all([getAccountId(), getCredentials()]);
  const registry = `https://${accountId}.dkr.ecr.${config.region}.amazonaws.com`;
  execSync(`docker login -u ${user} -p ${password} -e none ${registry}`);
};

dockerLogin()
  .then(() => console.log('Logged in'))
  .catch(console.error);

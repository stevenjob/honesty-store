import { ECR, IAM, config } from 'aws-sdk';
import { spawn } from '../promise/child_process';
import { awsCheckFailures } from '../failure';
import { getAccountId } from '../iam/user';
import { ensureRepository } from './repository';
import * as winston from 'winston';

const getCredentials = async () => {
  const response = await new ECR({ apiVersion: '2015-09-21' })
    .getAuthorizationToken()
    .promise();
  const token = response.authorizationData[0].authorizationToken;
  const decodedToken = Buffer.from(token, 'base64').toString('utf8');
  const [user, password] = decodedToken.split(':');
  return { user, password };
};

export default async ({ imageName, repositoryName, tag }) => {
  winston.debug(`push: gather metadata`);
  const [accountId, { user, password }, { repositoryUri }] = await Promise.all([
    getAccountId(),
    getCredentials(),
    ensureRepository({ name: repositoryName })
  ]);
  winston.debug(`push: login`);
  await spawn(`docker`, `login`, `-u`, `${user}`, `-p`, `${password}`, `-e`,  `none`, `https://${repositoryUri}`);
  winston.debug(`push: tag`);
  await spawn(`docker`, `tag`, `${imageName}:latest`, `${repositoryUri}:${tag}`);
  winston.debug(`push: push`);
  await spawn(`docker`, `push`, `${repositoryUri}:${tag}`);

  return `${repositoryUri}:${tag}`;
};

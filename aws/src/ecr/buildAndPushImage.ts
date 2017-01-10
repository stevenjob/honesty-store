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

export default async ({ dir, repositoryName }) => {
  winston.debug(`push: gather metadata`);
  const [accountId, { user, password }, { repositoryUri }] = await Promise.all([
    getAccountId(),
    getCredentials(),
    ensureRepository({ name: repositoryName })
  ]);
  winston.debug(`buildAndPushImage: build`);
  await spawn(`docker`, `build`, `-t`, `${dir}`, `-f`, `${dir}/Dockerfile`, `.`);
  winston.debug(`buildAndPushImage: login`);
  await spawn(`docker`, `login`, `-u`, `${user}`, `-p`, `${password}`, `-e`,  `none`, `https://${repositoryUri}`);
  winston.debug(`buildAndPushImage: tag`);
  await spawn(`docker`, `tag`, `${dir}:latest`, `${repositoryUri}:latest`);
  winston.debug(`buildAndPushImage: push`);
  await spawn(`docker`, `push`, `${repositoryUri}:latest`);

  return `${repositoryUri}:latest`;
};

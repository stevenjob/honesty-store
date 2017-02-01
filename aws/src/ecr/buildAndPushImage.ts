import { ECR } from 'aws-sdk';
import * as winston from 'winston';
import { spawn } from '../promise/child_process';
import { ensureRepository } from './repository';

const getCredentials = async () => {
  const response = await new ECR({ apiVersion: '2015-09-21' })
    .getAuthorizationToken({ })
    .promise();
  const token = response.authorizationData[0].authorizationToken;
  const decodedToken = Buffer.from(token, 'base64').toString('utf8');
  const [user, password] = decodedToken.split(':');
  return { user, password };
};

export default async ({ dir, repositoryName }) => {
  winston.debug('push: gather metadata');
  const [{ user, password }, { repositoryUri }] = await Promise.all([
    getCredentials(),
    ensureRepository({ name: repositoryName })
  ]);
  const serverUrl = `https://${repositoryUri.split('/')[0]}`;
  winston.debug('buildAndPushImage: build');
  await spawn(`docker`, `build`, `-t`, `${dir}`, `-f`, `${dir}/Dockerfile`, `--rm=false`, `.`);
  winston.debug(`buildAndPushImage: login ${user} ${serverUrl}`);
  await spawn(`docker`, `login`, `-u`, `${user}`, `-p`, `${password}`, `-e`,  `none`, `${serverUrl}`);
  winston.debug(`buildAndPushImage: tag`);
  await spawn(`docker`, `tag`, `${dir}:latest`, `${repositoryUri}:latest`);
  winston.debug(`buildAndPushImage: push`);
  await spawn(`docker`, `push`, `${repositoryUri}:latest`);

  return `${repositoryUri}:latest`;
};

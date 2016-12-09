import { ECS } from 'aws-sdk';

export const clusterCreate = async (clusterName) => {
  await new ECS({ apiVersion: '2014-11-13' })
    .createCluster({ clusterName })
    .promise();
}

import { ECS } from 'aws-sdk';

export const clusterList = async () => {
  const response = await new ECS({ apiVersion: '2014-11-13' })
    .listClusters()
    .promise();

  return response.clusterArns;
}

export const clusterCreate = async (clusterName) => {
  await new ECS({ apiVersion: '2014-11-13' })
    .createCluster({ clusterName })
    .promise();
}

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

export const throwUnlessClusterExists = async (cluster) => {
  const clusters = (await new ECS({ apiVersion: '2014-11-13' })
    .describeClusters({ clusters: [ cluster ] })
    .promise())
    .clusters;

  if (clusters.length === 0) {
    throw `cluster ${cluster} doesn't exist`;
  }

  if (clusters[0].status !== 'ACTIVE') {
    throw `cluster ${cluster} isn't active`;
  }
};

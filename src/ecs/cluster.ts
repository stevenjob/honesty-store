import { ECS } from 'aws-sdk';

/*
requires:
"Action": "ecs:ListClusters"
*/
export const clusterList = async () => {
  const response = await new ECS({ apiVersion: '2014-11-13' })
    .listClusters()
    .promise();

  return response.clusterArns;
}

/*
requires:
"Action": "ecs:CreateCluster",
*/
export const clusterCreate = async (clusterName) => {
  await new ECS({ apiVersion: '2014-11-13' })
    .createCluster({ clusterName })
    .promise();
}

/*
requires:
"Action": "ecs:DescribeClusters"
*/
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

/*
requires:
"Action": "ecs:DescribeClusters"
*/
export const clusterDescribe = async ({ name }) =>
  (await new ECS({ apiVersion: '2014-11-13' })
    .describeClusters({ clusters: [ name ] })
    .promise())
    .clusters[0]

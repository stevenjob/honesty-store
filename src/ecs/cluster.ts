import { ECS } from 'aws-sdk';
import { awsCheckFailures } from '../failure';

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
export const clusterDescribe = async ({ name }) => {
  const response = await new ECS({ apiVersion: '2014-11-13' })
    .describeClusters({ clusters: [ name ] })
    .promise()

  awsCheckFailures(response);

  return response.clusters[0]
};

/*
requires:
"Action": "ecs:DescribeClusters"
*/
export const throwUnlessClusterExists = async (cluster) => {
  const response = await new ECS({ apiVersion: '2014-11-13' })
    .describeClusters({ clusters: [ cluster ] })
    .promise()

  awsCheckFailures(response);

  const clusters = response.clusters;

  if (clusters.length === 0) {
    throw `cluster ${cluster} doesn't exist`;
  }

  if (clusters[0].status !== 'ACTIVE') {
    throw `cluster ${cluster} isn't active`;
  }
};

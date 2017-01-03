import { ECS } from 'aws-sdk';
import { awsCheckFailures } from '../failure';

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
const clusterDescribe = async ({ cluster }) => {
  const response = await new ECS({ apiVersion: '2014-11-13' })
    .describeClusters({ clusters: [ cluster ] })
    .promise()

  awsCheckFailures(response);

  return response.clusters[0]
};

/*
requires:
"Action": "ecs:DescribeClusters"
*/
export const throwUnlessClusterExists = async ({ cluster }) => {
  const clusterDesc = await clusterDescribe({ cluster });

  if (clusterDesc == undefined) {
    throw `cluster "${cluster}" doesn't exist`;
  }

  if (clusterDesc.status !== 'ACTIVE') {
    throw `cluster "${cluster}" isn't active`;
  }
};

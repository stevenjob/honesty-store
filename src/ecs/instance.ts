import { ECS } from 'aws-sdk';

export const containerInstanceList = async ({ cluster }) => {
  const response = await new ECS({ apiVersion: '2016-11-15' })
    .listContainerInstances({ cluster })
    .promise();

  return response.containerInstanceArns;
}

/*
requires:
"Action": "ecs:DescribeContainerInstances"
"Resource": "arn:aws:ecs:eu-west-1:104344427327:container-instance/<container glob>"
*/
export const containerInstanceDescribe = async ({ containerInstances, cluster }) => {
  const response = await new ECS({ apiVersion: '2016-11-15' })
    .describeContainerInstances({ containerInstances, cluster })
    .promise();

  return response.containerInstances;
}

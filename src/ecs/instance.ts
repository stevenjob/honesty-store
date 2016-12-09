import { ECS } from 'aws-sdk';

export const containerInstanceList = async ({ cluster }) => {
  const response = await new ECS({ apiVersion: '2016-11-15' })
    .listContainerInstances({ cluster })
    .promise();

  return response.containerInstanceArns;
}

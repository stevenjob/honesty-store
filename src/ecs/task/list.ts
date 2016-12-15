import { ECS } from 'aws-sdk';

export const taskList = async ({ cluster }) => {
  const response = await new ECS({ apiVersion: '2014-11-13' })
    .listTasks({ cluster })
    .promise();

  return response.taskArns;
}

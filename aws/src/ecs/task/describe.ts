import { ECS } from 'aws-sdk';
import { awsCheckFailures } from '../../failure';

export const tasksDescribe = async ({ tasks, cluster }) => {
  const response = await new ECS({ apiVersion: '2014-11-13' })
    .describeTasks({ tasks, cluster })
    .promise();

  awsCheckFailures(response);

  return response.tasks;
}

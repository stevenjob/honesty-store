import { ECS } from 'aws-sdk';

export const runTask = async ({ taskName, cluster, instance }) => {
  const taskLocation = {
    cluster,
    taskDefinition: taskName,
    containerInstances: [ instance ]
  };

  return await new ECS({ apiVersion: '2014-11-13' })
    .startTask(taskLocation)
    .promise();
}

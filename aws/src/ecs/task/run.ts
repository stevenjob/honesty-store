import { ECS } from 'aws-sdk';

/*
requires:
"Action": "ecs:StartTask"
resource: "arn:aws:ecs:<region>:<uid>:task-definition/<task-glob>"
*/
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

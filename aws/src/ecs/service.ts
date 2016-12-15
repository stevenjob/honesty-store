import { ECS } from 'aws-sdk';
import { awsCheckFailures } from '../failure';

/*
requires:
"Action": "ecs:CreateService"
*/
export const serviceCreate = async ({ name, cluster, task }) => {
  const ecs = new ECS({ apiVersion: '2014-11-13' });

  try {
    const response = await ecs
      .createService({
        serviceName: name,
        cluster,
        taskDefinition: task,
        desiredCount: 1,
      })
      .promise();

  } catch (e) {
    if (e.code !== 'InvalidParameterException'
    || !/Creation of service was not idempotent/.test(e.message))
    {
      throw e;
    }

    // service exists, need to update with the new task-definition
    await ecs
      .updateService({
        cluster,
        service: name,
        taskDefinition: task
      })
      .promise();
  }
}

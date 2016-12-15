import { ECS } from 'aws-sdk';
import { awsCheckFailures } from '../failure';

/*
requires:
"Action": "ecs:CreateService"
*/
export const serviceCreate = async ({ name, cluster, task }) => {
  const createParams = {
    serviceName: name,
    cluster,
    taskDefinition: task,
    desiredCount: 1,
  };

  const ecs = new ECS({ apiVersion: '2014-11-13' });

  try {
    const response = await ecs
      .createService(createParams)
      .promise();

    return;

  } catch (e) {
    if (e.code === 'InvalidParameterException'
    && /Creation of service was not idempotent/.test(e.message))
    {
      // service exists
    }
    else
    {
      throw e;
    }
  }

  // service exists, need to update with the new task-definition
  const updateParams = {
    cluster,
    service: name,
    taskDefinition: task
  };

  await ecs.updateService(updateParams).promise();
}

export const serviceList = async ({ cluster }) => {
  const response = await new ECS({ apiVersion: '2014-11-13' })
    .listServices({ cluster })
    .promise();

  return response.serviceArns;
}

export const serviceDescribe = async ({ services, cluster }) => {
  const response = await new ECS({ apiVersion: '2014-11-13' })
    .describeServices({ services, cluster })
    .promise();

  awsCheckFailures(response);

  return response.services;
}

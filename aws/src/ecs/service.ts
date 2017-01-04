import { ECS } from 'aws-sdk';
import * as winston from 'winston';
import { awsCheckFailures } from '../failure';

/*
requires:
"Action": "ecs:CreateService"
*/
export const ensureService = async (serviceRequest: ECS.CreateServiceRequest) => {
  const ecs = new ECS({ apiVersion: '2014-11-13' });
  try {
    const createResponse = await ecs
      .createService(serviceRequest)
      .promise();

    const service = createResponse.service;

    winston.debug('service: createService', service);

    return service;
  } catch (e) {
    if (e.code !== 'InvalidParameterException'
      || !/Creation of service was not idempotent/.test(e.message)) {
      throw e;
    }
    // service exists, need to update with the new task-definition
    // TODO: guarantee existing service matches load balancer and role settings
    // "InvalidParameterException: The target group xxx does not exist." is a symptom of this

    winston.debug('service: updateService');

    const updateResponse = await ecs
      .updateService({
        cluster: serviceRequest.cluster,
        service: serviceRequest.serviceName,
        taskDefinition: serviceRequest.taskDefinition,
        desiredCount: serviceRequest.desiredCount,
      })
      .promise();

    const service = updateResponse.service;

    winston.debug('service: updateService', service);

    const waitResponse = await ecs.waitFor('tasksRunning', {
      cluster: serviceRequest.cluster,
      tasks: [serviceRequest.taskDefinition]
    })
      .promise();

    awsCheckFailures(waitResponse);
    // no failures - task(s) are running

    return service;
  }
};

const parseServiceArn = (serviceArn) => {
  // e.g. "arn:aws:ecs:eu-west-1:812374064424:service/web"
  const [arn, aws, ecs, region, accountId, serviceName] = serviceArn.split(':');
  const [service, name] = serviceName.split('/');
  return {
    name
  };
};

const retireService = async ({ cluster, service }) => {
  const ecs = new ECS({ apiVersion: '2014-11-13' });
  await ecs.updateService({ cluster, service, desiredCount: 0 })
    .promise();
  await ecs.deleteService({ cluster, service })
    .promise();
};

export const pruneServices = async ({ cluster, filter = ({ name }) => false }) => {
  const ecs = new ECS({ apiVersion: '2014-11-13' });

  winston.debug('service: cluster', cluster);

  const listResponse = await ecs.listServices({ cluster })
    .promise();

  winston.debug('service: listResponse', listResponse.serviceArns);

  const serviceArnsToPrune = listResponse.serviceArns
    .filter(serviceArn => filter(parseServiceArn(serviceArn)));

  winston.debug('service: serviceArnsToPrune', serviceArnsToPrune);

  const promises = serviceArnsToPrune.map(service => retireService({ cluster, service }));

  await Promise.all(promises);
};
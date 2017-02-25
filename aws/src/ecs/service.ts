import { ECS } from 'aws-sdk';
import * as winston from 'winston';
import { awsCheckFailures } from '../failure';
import { listAll } from '../list';

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
        desiredCount: serviceRequest.desiredCount
      })
      .promise();

    const service = updateResponse.service;

    winston.debug('service: updateService', service);

    return service;
  }
};

const paginate = (array, limit: number) => {
  const pages = [];
  for (let i = 0; i < array.length; i = i + limit) {
    pages.push(array.slice(i, i + limit));
  }
  return pages;
};

export const waitForServicesStable = async ({ cluster, services }) => {

  const servicePages = paginate(services, 10);

  const waitPromises = servicePages.map(
    page => new ECS({ apiVersion: '2014-11-13' })
      .waitFor('servicesStable', {
        cluster,
        services: page
      })
      .promise());

  const waitResponses = await Promise.all(waitPromises);

  waitResponses.forEach(awsCheckFailures);
  // no failures - task(s) are running
};

const parseServiceArn = (serviceArn) => {
  // e.g. "arn:aws:ecs:eu-west-1:812374064424:service/web"
  const [arn, aws, ecs, region, accountId, serviceName] = serviceArn.split(':');
  const [service, name] = serviceName.split('/');
  return {
    arn,
    aws,
    ecs,
    region,
    accountId,
    service,
    name
  };
};

export const pruneServices = async ({ cluster, filter = (_: { name }) => false }) => {
  const ecs = new ECS({ apiVersion: '2014-11-13' });

  winston.debug('service: cluster', cluster);

  const listResponse = await listAll(
    (nextToken) => ecs.listServices({ cluster, nextToken }),
    (response) => response.serviceArns
  );

  winston.debug('service: listResponse', listResponse);

  const serviceArnsToPrune = listResponse.filter(serviceArn => filter(parseServiceArn(serviceArn)));

  winston.debug('service: serviceArnsToPrune', serviceArnsToPrune);

  if (serviceArnsToPrune.length > 0) {
    const updatePromises = serviceArnsToPrune.map(service =>
      ecs.updateService({ cluster, service, desiredCount: 0 })
        .promise()
    );

    await Promise.all(updatePromises);

    await waitForServicesStable({ cluster, services: serviceArnsToPrune });

    winston.debug('service: services stable', listResponse);

    const deletePromises = serviceArnsToPrune.map(service =>
      ecs.deleteService({ cluster, service })
        .promise()
    );

    await Promise.all(deletePromises);
  }
};

import { ECS } from 'aws-sdk';
import * as winston from 'winston';
import { listAll } from '../list';

/*
requires:
"Action": "ecs:RegisterTaskDefinition", "ecs:DescribeTaskDefinition"
*/
export const ensureTaskDefinition = async ({ family, containerDefinitions, taskRoleArn }) => {
    const definitionResponse = await new ECS({ apiVersion: '2014-11-13' })
        .registerTaskDefinition({ family, containerDefinitions, taskRoleArn })
        .promise();

    const taskDefinition = definitionResponse.taskDefinition;

    winston.debug('taskDefinition: ensureTaskDefinition', taskDefinition);

    return taskDefinition;
};

const parseTaskDefinitionArn = (taskDefinitionArn) => {
    // e.g. "arn:aws:ecs:eu-west-1:812374064424:task-definition/honesty-store-master-nginx-1:4"
    const [arn, aws, ecs, region, accountId, taskDefinitionFamily, revision] = taskDefinitionArn.split(':');
    const [taskDefinition, family] = taskDefinitionFamily.split('/');
    return {
        taskDefinition,
        arn,
        aws,
        ecs,
        region,
        accountId,
        family,
        revision: Number(revision)
    };
};

/*
requires:
"Action": "ecs:RegisterTaskDefinition", "ecs:DescribeTaskDefinition"
*/
export const pruneTaskDefinitions = async ({ filter = (_: { family, revision }) => false }) => {
    const ecs = new ECS({ apiVersion: '2014-11-13' });

    const listResponse = await listAll(
        (nextToken) => ecs.listTaskDefinitions({ nextToken }),
        (response) => response.taskDefinitionArns
    );

    winston.debug('taskDefinition: listResponse', listResponse);

    const taskDefinitionArnsToPrune = listResponse.filter(
        taskDefinitionArn => filter(parseTaskDefinitionArn(taskDefinitionArn))
    );

    winston.debug('taskDefinition: taskDefinitionArnsToPrune', taskDefinitionArnsToPrune);

    const promises = taskDefinitionArnsToPrune.map(taskDefinitionArn =>
        ecs.deregisterTaskDefinition({ taskDefinition: taskDefinitionArn })
            .promise()
    );

    await Promise.all(promises);
};

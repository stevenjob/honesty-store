import { CloudFormation } from 'aws-sdk';
import { readFileSync } from 'fs';
import * as winston from 'winston';

import { listAll } from '../list';

export const isStackPresent = async (name: string) => {
  const cloudFormation = new CloudFormation({
    apiVersion: '2010-05-15'
  });

  const stackSummaries = await listAll(
    nextToken => cloudFormation.listStacks({
      NextToken: nextToken,
      StackStatusFilter: [
        // all except deleted
        'CREATE_IN_PROGRESS',
        'CREATE_FAILED',
        'CREATE_COMPLETE',
        'ROLLBACK_IN_PROGRESS',
        'ROLLBACK_FAILED',
        'ROLLBACK_COMPLETE',
        'DELETE_IN_PROGRESS',
        'DELETE_FAILED',
        //'DELETE_COMPLETE',
        'UPDATE_IN_PROGRESS',
        'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS',
        'UPDATE_COMPLETE',
        'UPDATE_ROLLBACK_IN_PROGRESS',
        'UPDATE_ROLLBACK_FAILED',
        'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS',
        'UPDATE_ROLLBACK_COMPLETE',
        'REVIEW_IN_PROGRESS'
      ]
    }),
    response => response.StackSummaries,
    response => response.NextToken
  );

  const names = stackSummaries
    .reduce<CloudFormation.StackSummaries>((all, cur) => all.concat(cur), [])
    .map(({ StackName }) => StackName);

  return names.indexOf(name) !== -1;
};

export const ensureStack = async ({ name, templateName, params }) => {
  const cloudFormation = new CloudFormation({
    apiVersion: '2010-05-15',
    s3ForcePathStyle: true
  });

  const createUpdateParams = {
    StackName: name,
    TemplateBody: readFileSync(templateName, 'utf8'),
    Parameters: Object.keys(params)
      .map((key) => ({
        ParameterKey: key,
        ParameterValue: params[key]
      })),
    Capabilities: ['CAPABILITY_IAM']
  };

  try {

    const createResponse = await cloudFormation.createStack(createUpdateParams)
      .promise();
    winston.debug(`stack: createStack`, createResponse.StackId);
    await cloudFormation.waitFor('stackCreateComplete', { StackName: name })
      .promise();

  } catch (e) {
    if (e.code !== 'AlreadyExistsException') {
      throw e;
    }

    try {
      const updateResponse = await cloudFormation.updateStack(createUpdateParams)
        .promise();
      winston.debug(`stack: updateStack`, updateResponse.StackId);
      await cloudFormation.waitFor('stackUpdateComplete', { StackName: name })
        .promise();
    } catch (e) {
      if (e.code !== 'ValidationError' || e.message !== 'No updates are to be performed.') {
        throw e;
      }
    }
  }

  const describeResponse = await cloudFormation.describeStacks({ StackName: name })
    .promise();

  return describeResponse.Stacks[0].Outputs.reduce<any>(
    (object, output) => {
      object[output.OutputKey] = output.OutputValue;
      return object;
    },
    {}
  );
};

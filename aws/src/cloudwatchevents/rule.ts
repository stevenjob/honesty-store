import { CloudWatchEvents } from 'aws-sdk';
import * as winston from 'winston';

export const ensureRule = async ({ name, schedule }) => {
  const cloudWatchEvents = new CloudWatchEvents({ apiVersion: '2015-10-07' });
  const response = await cloudWatchEvents.putRule({
    Name: name,
    ScheduleExpression: schedule,
    State: 'ENABLED'
  })
    .promise();

  winston.debug(`rule: putRule`, response);

  return response;
};

export const pruneRules = async (filter = (_: CloudWatchEvents.Rule) => false) => {
  const cloudWatchEvents = new CloudWatchEvents({ apiVersion: '2015-10-07' });

  const listResponse = await cloudWatchEvents.listRules()
    .promise();

  winston.debug(`pruneRules: rules`, listResponse.Rules);

  const promises = listResponse.Rules
    .filter(filter)
    .map((rule) =>
      cloudWatchEvents.deleteRule({ Name: rule.Name })
        .promise()
    );

  return await Promise.all(promises);
};

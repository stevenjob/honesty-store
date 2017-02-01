import { CloudWatchLogs } from 'aws-sdk';
import * as winston from 'winston';
import { describeAll } from '../describe';

export const ensureLogGroup = async ({ name, retention }) => {
    const cloudwatchlogs = new CloudWatchLogs({apiVersion: '2014-03-28'});
    try {
        await cloudwatchlogs.createLogGroup({ logGroupName: name })
            .promise();
    } catch (e) {
        if (e.code !== 'ResourceAlreadyExistsException') {
            throw e;
        }
    }
    await cloudwatchlogs.putRetentionPolicy({ logGroupName: name, retentionInDays: retention })
        .promise();
};

export const pruneLogGroups = async ({ filter = (_: { name }) => false }) => {
    const cloudwatchlogs = new CloudWatchLogs({apiVersion: '2014-03-28'});

    const describeResponse = await describeAll(
        (nextToken) => cloudwatchlogs.describeLogGroups({ nextToken }),
        (response) => response.logGroups
    );

    winston.debug('logGroups: describeResponse', describeResponse);

    const logGroupsToPrune = describeResponse.filter(
        logGroup => filter({ name: logGroup.logGroupName })
    );

    winston.debug('logGroups: logGroupsToPrune', logGroupsToPrune);

    const promises = logGroupsToPrune.map(logGroup =>
        cloudwatchlogs.deleteLogGroup({ logGroupName: logGroup.logGroupName })
            .promise()
    );

    await Promise.all(promises);
};

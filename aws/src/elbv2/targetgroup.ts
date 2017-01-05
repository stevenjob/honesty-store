import { ELBv2 } from 'aws-sdk';
import * as winston from 'winston';
import { describeAll } from '../describe';

export const ensureTargetGroup = async ({ name }) => {
    const elbv2 = new ELBv2({ apiVersion: '2015-12-01' });

    const response = await elbv2
        .createTargetGroup({
            Name: name,
            Protocol: 'HTTP',
            Port: 80,
            VpcId: 'vpc-d68ecdb2'
        })
        .promise();

    const targetGroup = response.TargetGroups[0];

    winston.debug('targetGroup: ensureTargetGroup', targetGroup);

    const modifyResponse = await elbv2
        .modifyTargetGroupAttributes({
            TargetGroupArn: targetGroup.TargetGroupArn,
            Attributes: [{
                Key: 'deregistration_delay.timeout_seconds',
                Value: '5',
            }]
        })
        .promise();

    winston.debug('targetGroup: modifyTargetGroupAttributes', modifyResponse);

    return targetGroup;
};

export const pruneTargetGroups = async ({ filter = (targetGroup: ELBv2.TargetGroup) => false }) => {
    const elbv2 = new ELBv2({ apiVersion: '2015-12-01' });

    const describeResponse = await describeAll(
        (Marker) => elbv2.describeTargetGroups({ Marker }),
        (response) => response.TargetGroups
    );

    winston.debug('targetGroup: describeResponse', describeResponse);

    const targetGroupsToPrune = describeResponse.filter(filter);

    winston.debug('targetGroup: targetGroupsToPrune', targetGroupsToPrune);

    const promises = targetGroupsToPrune.map(targetGroup =>
        elbv2.deleteTargetGroup({ TargetGroupArn: targetGroup.TargetGroupArn })
            .promise()
    );

    await Promise.all(promises);
};
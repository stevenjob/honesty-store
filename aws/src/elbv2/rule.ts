import { ELBv2 } from 'aws-sdk';
import * as winston from 'winston';

export const ensureRule = async ({ listenerArn, pathPattern, priority, targetGroupArn }) => {
    const response = await new ELBv2({ apiVersion: '2015-12-01' })
        .createRule({
            Priority: priority,
            Actions: [
                { TargetGroupArn: targetGroupArn, Type: 'forward' }
            ],
            Conditions: [
                { Field: 'path-pattern', Values: [pathPattern] }
            ],
            ListenerArn: listenerArn
        })
        .promise();

    const rule = response.Rules[0];

    winston.debug(`rule: ensureRule`, rule);

    return rule;
};

export const pruneRules = async ({ listenerArn, filter = (rule: ELBv2.Rule) => false }) => {
    const elbv2 = new ELBv2({ apiVersion: '2015-12-01' });

    const describeResponse = await elbv2.describeRules({
        ListenerArn: listenerArn
    })
        .promise();

    winston.debug(`rule: pruneRules ${describeResponse.Rules}`);

    const rulesToPrune = describeResponse.Rules
        .filter(filter);

    winston.debug(`rule: rulesToPrune ${rulesToPrune}`);

    const promises = rulesToPrune.map(rule =>
        elbv2.deleteRule({ RuleArn: rule.RuleArn })
            .promise()
    );

    await Promise.all(promises);
};
import { ELBv2 } from 'aws-sdk';
import * as winston from 'winston';

export const ensureRule = async ({ listenerArn, pathPattern, priority, targetGroupArn }) => {
    const Actions = [
        { TargetGroupArn: targetGroupArn, Type: 'forward' }
    ];

    const Conditions = [
        { Field: 'path-pattern', Values: [pathPattern] }
    ];

    const elbv2 = new ELBv2({ apiVersion: '2015-12-01' });
    try {
        const response = await elbv2.createRule({
            Priority: priority,
            Actions,
            Conditions,
            ListenerArn: listenerArn
        })
            .promise();

        const rule = response.Rules[0];

        winston.debug(`rule: createRule`, rule);

        return rule;
    }
    catch (e) {
        if (e.code !== 'PriorityInUse') {
            throw e;
        }

        const describeResponse = await elbv2.describeRules({ ListenerArn: listenerArn })
            .promise();

        winston.debug(`rule: describeResponse`, describeResponse.Rules);

        const existingRule = describeResponse.Rules
            // using weak comparison because AWS is actually returning a number...
            .find(rule => rule.Priority == priority);

        winston.debug(`rule: existingRule`, existingRule);

        const updateResonse = await elbv2.modifyRule({
            RuleArn: existingRule.RuleArn,
            Actions,
            Conditions
        })
            .promise();

        const updatedRule = updateResonse.Rules[0];

        winston.debug(`rule: modifyRule`, updatedRule);

        return updatedRule;
    }

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
import { ELBv2 } from 'aws-sdk';
import * as winston from 'winston';

export const ensureListener = async ({ defaultTargetGroupArn, loadBalancerArn, port }) => {
    const response = await new ELBv2({ apiVersion: '2015-12-01' })
        .createListener({
            Certificates: [
                {
                    CertificateArn: 'arn:aws:acm:eu-west-1:812374064424:certificate/0fd0796a-98c9-4e3c-8316-1efcf70aae77'
                }
            ],
            DefaultActions: [
                {
                    TargetGroupArn: defaultTargetGroupArn,
                    Type: 'forward'
                }
            ],
            LoadBalancerArn: loadBalancerArn,
            Port: port,
            Protocol: 'HTTPS'
        })
        .promise();

    const listener = response.Listeners[0];

    winston.debug(`listener: ensureListener`, listener)

    return listener;
};

export const pruneListeners = async ({ loadBalancerArn, filter = (listener: ELBv2.Listener) => false }) => {
    const elbv2 = new ELBv2({ apiVersion: '2015-12-01' });

    winston.debug('listener: loadBalancerArn', loadBalancerArn);

    const describeResponse = await elbv2.describeListeners({
        LoadBalancerArn: loadBalancerArn
    })
        .promise();

    winston.debug('listener: listeners', describeResponse.Listeners);

    const listenersToPrune = describeResponse.Listeners
        .filter(filter);

    winston.debug('listener: listenersToPrune', listenersToPrune);

    const promises = listenersToPrune.map(listener =>
        elbv2.deleteListener({ ListenerArn: listener.ListenerArn })
            .promise()
    );

    await Promise.all(promises);
};
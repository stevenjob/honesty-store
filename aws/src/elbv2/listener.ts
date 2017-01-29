import { ELBv2 } from 'aws-sdk';
import * as winston from 'winston';
import { describeAll } from '../describe';

const lookupPort = (protocol) => {
    switch (protocol) {
        case 'HTTPS':
            return 443;
        case 'HTTP':
            return 80;
        default:
            throw new Error(`Invalid protocol ${protocol}`);
    }
}


export const ensureListener = async ({ defaultTargetGroupArn, loadBalancerArn, certificateArn, protocol }) => {
    const response = await new ELBv2({ apiVersion: '2015-12-01' })
        .createListener({
            Certificates: [
                {
                    CertificateArn: certificateArn
                }
            ],
            DefaultActions: [
                {
                    TargetGroupArn: defaultTargetGroupArn,
                    Type: 'forward'
                }
            ],
            LoadBalancerArn: loadBalancerArn,
            Port: lookupPort(protocol),
            Protocol: protocol
        })
        .promise();

    const listener = response.Listeners[0];

    winston.debug(`listener: ensureListener`, listener)

    return listener;
};

export const pruneListeners = async ({ loadBalancerArn, filter = (listener: ELBv2.Listener) => false }) => {
    const elbv2 = new ELBv2({ apiVersion: '2015-12-01' });

    winston.debug('listener: loadBalancerArn', loadBalancerArn);

    const describeResponse = await describeAll(
        (Marker) => elbv2.describeListeners({
            LoadBalancerArn: loadBalancerArn,
            Marker
        }),
        (response) => response.Listeners);

    winston.debug('listener: listeners', describeResponse);

    const listenersToPrune = describeResponse.filter(filter);

    winston.debug('listener: listenersToPrune', listenersToPrune);

    const promises = listenersToPrune.map(listener =>
        elbv2.deleteListener({ ListenerArn: listener.ListenerArn })
            .promise()
    );

    await Promise.all(promises);
};

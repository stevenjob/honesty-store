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
};

export const ensureListener = async ({ defaultTargetGroupArn, loadBalancerArn, certificateArn, protocol }) => {
  /* tslint:disable:variable-name */
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
  /* tslint:enable:variable-name */

  const listener = response.Listeners[0];

  winston.debug('listener: ensureListener', listener);

  return listener;
};

export const pruneListeners = async ({ loadBalancerArn, filter = (_listener: ELBv2.Listener) => false }) => {
  const elbv2 = new ELBv2({ apiVersion: '2015-12-01' });

  winston.debug('listener: loadBalancerArn', loadBalancerArn);

  /* tslint:disable:variable-name */
  const describeResponse = await describeAll(
    (Marker) => elbv2.describeListeners({
      LoadBalancerArn: loadBalancerArn,
      Marker
    }),
    (response) => response.Listeners);
  /* tslint:enable:variable-name */

  winston.debug('listener: listeners', describeResponse);

  const listenersToPrune = describeResponse.filter(filter);

  winston.debug('listener: listenersToPrune', listenersToPrune);

  const promises = listenersToPrune.map(listener =>
    elbv2.deleteListener({ ListenerArn: listener.ListenerArn })
      .promise()
  );

  await Promise.all(promises);
};

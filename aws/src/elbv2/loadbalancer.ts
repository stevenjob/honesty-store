import { ELBv2 } from 'aws-sdk';
import * as winston from 'winston';

export const ensureLoadBalancer = async ({ name, securityGroups, subnets }) => {
  const loadBalancerResponse = await new ELBv2({ apiVersion: '2015-12-01' })
    .createLoadBalancer({
      Name: name,
      Scheme: 'internet-facing',
      SecurityGroups: securityGroups,
      Subnets: subnets
    })
    .promise();

  const loadBalancer = loadBalancerResponse.LoadBalancers[0];

  winston.debug('loadBalancer: ensureLoadBalancer', loadBalancer);

  return loadBalancer;
};

export const pruneLoadBalancers = async ({ filter = (_loadBalancer: ELBv2.LoadBalancer) => false }) => {
  const elbv2 = new ELBv2({ apiVersion: '2015-12-01' });

  const describeResponse = await elbv2.describeLoadBalancers({})
    .promise();

  winston.debug('loadBalancer: loadBalancers', describeResponse.LoadBalancers);

  const loadBalancersToPrune = describeResponse.LoadBalancers
    .filter(filter);

  winston.debug('loadBalancer: loadBalancersToPrune', loadBalancersToPrune);

  const promises = loadBalancersToPrune.map(loadBalancer =>
    elbv2.deleteLoadBalancer({ LoadBalancerArn: loadBalancer.LoadBalancerArn })
      .promise()
  );

  await Promise.all(promises);
};

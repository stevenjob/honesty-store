import { ECS } from 'aws-sdk';
import { ensureListener } from '../elbv2/listener';
import { ensureLoadBalancer } from '../elbv2/loadbalancer';
import { ensureTargetGroup } from '../elbv2/targetgroup';
import { ensureRule } from '../elbv2/rule';
import { templateJSON } from '../template';
import { ensureTaskDefinition, pruneTaskDefinitions } from '../ecs/taskDefinition';
import pushImage from '../ecr/push';
import { createHash } from 'crypto';
import { ensureService } from '../ecs/service';
import * as winston from 'winston';


export const loadBalancerName = 'hs';
export const defaultTargetGroupDir = 'web';
export const role = 'arn:aws:iam::812374064424:role/ecs-service-role';
export const cluster = 'test-cluster';

const ruleMappings = {
    web: { pathPattern: '/', priority: 10 },
    api: { pathPattern: '/api', priority: 1 },
    nginx: { pathPattern: '/test', priority: 2 },
};

export const branchToPort = (branch) => {
    if (branch === 'master') {
        return 443;
    }
    const port = createHash('sha256')
        .update(branch)
        .digest()
        .readUInt16LE(0);
    if (port === 80 || port === 443) {
        throw new Error('Port conflict');
    }
    return port;
};

// TODO: doesn't remove resources left over when a dir is deleted until the branch is deleted
export default async ({ branch, dir }) => {
    const port = branchToPort(branch);
    const loadBalancer = await ensureLoadBalancer({
        name: loadBalancerName
    });
    const defaultTargetGroup = await ensureTargetGroup({
        name: `${loadBalancerName}-${branch}-${defaultTargetGroupDir}`
    });
    const listener = await ensureListener({
        loadBalancerArn: loadBalancer.LoadBalancerArn,
        defaultTargetGroupArn: defaultTargetGroup.TargetGroupArn,
        port
    });
    const targetGroup = await ensureTargetGroup({
        name: `${loadBalancerName}-${branch}-${dir}`
    });
    const rule = await ensureRule({
        listenerArn: listener.ListenerArn,
        targetGroupArn: targetGroup.TargetGroupArn,
        pathPattern: ruleMappings[dir].pathPattern,
        priority: ruleMappings[dir].priority
    });
    const image = await pushImage({
        imageName: dir,
        repositoryName: `${loadBalancerName}-${branch}-${dir}`,
        tag: 'latest'
    });
    const containerDefinitions: ECS.ContainerDefinitions = await templateJSON({
        type: 'containerDefinition',
        name: dir,
        data: { image }
    });
    const taskDefinition = await ensureTaskDefinition({
        family: `${loadBalancerName}-${branch}-${dir}`,
        containerDefinitions
    });
    await pruneTaskDefinitions({
        filter: ({ family, revision }) => family === taskDefinition.family && revision !== taskDefinition.revision,
    });
    // For now assuming all tasks contain only one container with a port mapping which should be load balanced
    const service = await ensureService({
        serviceName: `${loadBalancerName}-${branch}-${dir}`,
        cluster,
        desiredCount: 1,
        taskDefinition: taskDefinition.taskDefinitionArn,
        loadBalancers: [
            {
                containerName: containerDefinitions[0].name,
                containerPort: containerDefinitions[0].portMappings[0].containerPort,
                targetGroupArn: targetGroup.TargetGroupArn
            }
        ],
        role
    });
    winston.info(`Deployed to https://${loadBalancer.DNSName}:${listener.Port}${rule.Conditions[0].Values[0]}.`);
};
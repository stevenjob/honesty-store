import { ECS } from 'aws-sdk';
import { ensureListener } from '../elbv2/listener';
import { ensureLoadBalancer } from '../elbv2/loadbalancer';
import { ensureTargetGroup } from '../elbv2/targetgroup';
import { ensureRule } from '../elbv2/rule';
import dirToTable from '../table/tables';
import { ensureTaskDefinition, pruneTaskDefinitions } from '../ecs/taskDefinition';
import buildAndPushImage from '../ecr/buildAndPushImage';
import { createHash } from 'crypto';
import { ensureService, waitForServicesStable } from '../ecs/service';
import { ensureTable } from '../dynamodb/table';
import { ensureAlias, aliasToBaseUrl } from '../route53/alias';
import { ensureLogGroup } from '../cloudwatchlogs/loggroup';
import containerForDir from '../containerDefinition/containers'
import * as winston from 'winston';

export const prefix = 'hs';
export const defaultTargetGroupDir = 'web';
export const ecsServiceRole = 'arn:aws:iam::812374064424:role/ecs-service-role';
export const cluster = 'test-cluster';

const config = {
    web: {
        loadBalancer: { pathPattern: '/*', priority: 10 }
    },
    api: {
        loadBalancer: { pathPattern: '/api/*', priority: 1 }
    },
    transaction: {
        database: true,
        loadBalancer: { pathPattern: '/transaction/*', priority: 3 }
    },
    user: {
        database: true,
        loadBalancer: { pathPattern: '/user/*', priority: 4 }
    },
    topup: {
        database: true,
        loadBalancer: { pathPattern: '/topup/*', priority: 5 }
    },
};

const isLive = (branch) => branch === 'live';

const generateName = ({ branch, dir }: { branch: string, dir?: string }) => {
    const base = isLive(branch) ? `honesty-store` : `hs-${branch}`;
    return dir == null ? base : `${base}-${dir}`;
};

const ensureDatabase = async ({ branch, dir }) => {
    const capacityUnits = isLive(branch) ? 10 : 1;

    const { config, data } = dirToTable({
        dir,
        readCapacityUnits: capacityUnits,
        writeCapacityUnits: capacityUnits,
    });
    return await ensureTable({
        config: {
            ...config,
            TableName: generateName({ branch, dir })
        },
        data
    });
};

const generateStripeKey = ({ branch, type }) => {
    if (isLive(branch) && type === 'live') {
        return getAndAssertEnvironment('LIVE_STRIPE_KEY');
    }
    return getAndAssertEnvironment('TEST_STRIPE_KEY');
}

const generateSecret = ({ prefix, branch, liveSecret }) => {
    const bareSecret = () => {
        if (isLive(branch)) {
            return liveSecret;
        }
        return branch;
    };

    return `${prefix}:${bareSecret()}`;
};

const getAndAssertEnvironment = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`$${key} not present in environment`);
    }
    return value;
};

const getTaskRoleArn = ({ branch, database }) => {
    if (database) {
        return isLive(branch) ?
            'arn:aws:iam::812374064424:role/live-task-role' :
            'arn:aws:iam::812374064424:role/dynamo-db-role';
    }
    return undefined;
};

const getCertificateArn = ({ branch }) => isLive(branch) ?
    'arn:aws:acm:eu-west-1:812374064424:certificate/49b5410d-0c99-4de0-a222-3fe364bfbc73' :
    'arn:aws:acm:eu-west-1:812374064424:certificate/0fd0796a-98c9-4e3c-8316-1efcf70aae77';

// TODO: doesn't remove resources left over when a dir is deleted until the branch is deleted
export default async ({ branch, dirs }) => {
    const serviceSecret = generateSecret({
        prefix: 'service',
        branch,
        liveSecret: getAndAssertEnvironment('LIVE_SERVICE_TOKEN_SECRET')
    });
    const userSecret = generateSecret({
        prefix: 'user',
        branch,
        liveSecret: getAndAssertEnvironment('LIVE_USER_TOKEN_SECRET')
    });

    const baseUrl = aliasToBaseUrl(branch);
    const loadBalancer = await ensureLoadBalancer({
        name: generateName({ branch })
    });
    const resourceRecordSet = await ensureAlias({
        name: branch,
        value: loadBalancer.DNSName
    });
    const defaultTargetGroup = await ensureTargetGroup({
        name: generateName({ branch, dir: defaultTargetGroupDir })
    });
    const defaultListener = await ensureListener({
        loadBalancerArn: loadBalancer.LoadBalancerArn,
        defaultTargetGroupArn: defaultTargetGroup.TargetGroupArn,
        certificateArn: undefined,
        protocol: 'HTTP'
    });
    const listener = await ensureListener({
        loadBalancerArn: loadBalancer.LoadBalancerArn,
        defaultTargetGroupArn: defaultTargetGroup.TargetGroupArn,
        certificateArn: getCertificateArn({ branch }),
        protocol: 'HTTPS'
    });
    const services: ECS.Service[] = [];
    for (const dir of dirs) {
        const logGroup = generateName({ branch, dir });
        await ensureLogGroup({
            name: logGroup,
            retention: isLive(branch) ? 30 : 1
        })
        const targetGroup = await ensureTargetGroup({
            name: generateName({ branch, dir })
        });
        const rule = await ensureRule({
            listenerArn: listener.ListenerArn,
            targetGroupArn: targetGroup.TargetGroupArn,
            pathPattern: config[dir].loadBalancer.pathPattern,
            priority: config[dir].loadBalancer.priority
        });
        const image = await buildAndPushImage({
            dir,
            repositoryName: generateName({ branch, dir })
        });
        const db = config[dir].database ? await ensureDatabase({ branch, dir }) : {};
        // TODO: create bespoke roles
        const containerDefinitions = containerForDir({
            dir,
            data: {
                image,
                logGroup,
                tableName: db.TableName,
                baseUrl,
                serviceSecret,
                userSecret,
                liveStripeKey: generateStripeKey({ branch, type: 'live' }),
                testStripeKey: generateStripeKey({ branch, type: 'test' }),
            }
        });

        const taskDefinition = await ensureTaskDefinition({
            family: generateName({ branch, dir }),
            containerDefinitions,
            taskRoleArn: getTaskRoleArn({ branch, database: config[dir].database })
        });
        await pruneTaskDefinitions({
            filter: ({ family, revision }) => family === taskDefinition.family && revision !== taskDefinition.revision,
        });
        // For now assuming all tasks contain only one container with a port mapping which should be load balanced
        const service = await ensureService({
            serviceName: generateName({ branch, dir }),
            cluster,
            desiredCount: 1,
            taskDefinition: taskDefinition.taskDefinitionArn,
            loadBalancers: [
                {
                    containerName: taskDefinition.containerDefinitions[0].name,
                    containerPort: taskDefinition.containerDefinitions[0].portMappings[0].containerPort,
                    targetGroupArn: targetGroup.TargetGroupArn
                }
            ],
            role: ecsServiceRole
        });
        services.push(service);
    }

    winston.info(`Waiting for stability`);

    await waitForServicesStable({
        cluster,
        services: services.map(service => service.serviceName)
    });

    winston.info(`Deployed to ${baseUrl}`);
};

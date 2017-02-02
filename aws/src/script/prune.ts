import { ECS } from 'aws-sdk';
import { pruneLoadBalancers } from '../elbv2/loadbalancer';
import { pruneTargetGroups } from '../elbv2/targetgroup';
import { pruneRules } from '../elbv2/rule';
import dirToTable from '../table/tables';
import { pruneTaskDefinitions } from '../ecs/taskDefinition';
import { prefix, defaultTargetGroupDir, ecsServiceRole, cluster } from './deploy';
import { pruneServices } from '../ecs/service';
import { pruneRepositories } from '../ecr/repository';
import { pruneImages } from '../ecr/image';
import { getOriginBranchNames } from '../git/branch';
import { pruneTables } from '../dynamodb/table';
import { pruneAliases } from '../route53/alias';
import { pruneLogGroups } from '../cloudwatchlogs/loggroup'
import * as winston from 'winston';
import ms = require('ms');

const force = process.env.FORCE;

export default async () => {
    const branchNames = force ? ['live', 'test'] : Array.from(await getOriginBranchNames());

    const branchPrefixes = branchNames.map(branch => new RegExp(`${prefix}-${branch}(-|$)`));

    const matchesGlobalPrefix = (name) =>
        new RegExp(`^${prefix}-`).test(name);

    const matchesBranchPrefixes = (name) =>
        branchPrefixes.some(branchPrefix => branchPrefix.test(name));

    const filter = (name) => matchesGlobalPrefix(name) && !matchesBranchPrefixes(name)

    await pruneLoadBalancers({
        filter: ({ LoadBalancerName }) => filter(LoadBalancerName)
    });

    await pruneAliases({
        filter: (name) => !branchNames.some(branchName => branchName === name)
    });

    await pruneServices({
        cluster,
        filter: ({ name }) => filter(name)
    });

    await pruneTaskDefinitions({
        filter: ({ family, revision }) => filter(family)
    });

    // pruneListeners/pruneRules - listeners/rules belong to load balancers so are removed implicitly

    await pruneTargetGroups({
        filter: ({ TargetGroupName }) => filter(TargetGroupName)
    });

    await pruneRepositories({
        filter: ({ repositoryName }) => filter(repositoryName)
    });

    // TODO: won't prune tables from deleted dirs or dirs which no longer require db
    await pruneTables({
        filter
    });

    await pruneLogGroups({
        filter: ({ name }) => filter(name)
    })
};

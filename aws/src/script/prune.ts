import { ECS } from 'aws-sdk';
import { pruneListeners } from '../elbv2/listener';
import { ensureLoadBalancer } from '../elbv2/loadbalancer';
import { pruneTargetGroups } from '../elbv2/targetgroup';
import { pruneRules } from '../elbv2/rule';
import { templateJSON } from '../template';
import { pruneTaskDefinitions } from '../ecs/taskDefinition';
import { loadBalancerName, defaultTargetGroupDir, role, cluster, branchToPort } from './deploy';
import { pruneServices } from '../ecs/service';
import { pruneRepositories } from '../ecr/repository';
import { pruneImages } from '../ecr/image';
import { getOriginBranchNames } from '../git/branch';
import { pruneTables } from '../dynamodb/table';
import * as winston from 'winston';
import ms = require('ms');

export default async () => {
    const loadBalancer = await ensureLoadBalancer({
        name: loadBalancerName
    });

    const branchNames = Array.from(await getOriginBranchNames());

    const branchPrefixes = branchNames.map(branch => new RegExp(`${loadBalancerName}-${branch}-`));

    const matchesGlobalPrefix = (name) =>
        new RegExp(`^${loadBalancerName}-`).test(name);

    const matchesBranchPrefixes = (name) =>
        branchPrefixes.some(branchPrefix => branchPrefix.test(name));

    const isABranchPort = (port) => branchNames.some(branch => branchToPort(branch) === port);

    const filter = (name) => matchesGlobalPrefix(name) && !matchesBranchPrefixes(name)

    await pruneServices({
        cluster,
        filter: ({ name }) => filter(name)
    });

    await pruneTaskDefinitions({
        filter: ({ family, revision }) => filter(family)
    });

    // pruneRules - rules belong to listeners so are removed implicitly

    await pruneListeners({
        loadBalancerArn: loadBalancer.LoadBalancerArn,
        filter: (listener) => !isABranchPort(listener.Port)
    });

    await pruneTargetGroups({
        filter: (targetGroup) => filter(targetGroup.TargetGroupName)
    });

    await pruneRepositories({
        filter: (repository) => filter(repository.repositoryName)
    });

    // TODO: won't prune tables from deleted dirs or dirs which no longer require db
    await pruneTables({
        filter
    })
};

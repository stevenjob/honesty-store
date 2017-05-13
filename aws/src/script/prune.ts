import { pruneApiGateway, pruneDomainNames } from '../apigateway/gateway';
import { pruneLogGroups } from '../cloudwatchlogs/loggroup';
import { pruneTables } from '../dynamodb/table';
import { pruneRepositories } from '../ecr/repository';
import { pruneServices } from '../ecs/service';
import { pruneTaskDefinitions } from '../ecs/taskDefinition';
import { pruneLoadBalancers } from '../elbv2/loadbalancer';
import { pruneTargetGroups } from '../elbv2/targetgroup';
import { getOriginBranchNames } from '../git/branch';
import { pruneFunctions } from '../lambda/function';
import { aliasToName, pruneAliases } from '../route53/alias';
import { ensureWebStack, prefix } from './deploy';

const force = process.env.FORCE;

export default async () => {
  const branchNames = force ? ['live', 'test'] : Array.from(await getOriginBranchNames());

  const branchPrefixes = branchNames.map(branch => new RegExp(`${prefix}-${branch}(-|$)`));

  const matchesGlobalPrefix = (name) =>
    new RegExp(`^${prefix}-`).test(name);

  const matchesBranchPrefixes = (name) =>
    branchPrefixes.some(branchPrefix => branchPrefix.test(name));

  const filter = (name) => matchesGlobalPrefix(name) && !matchesBranchPrefixes(name);

  await pruneFunctions(
    lambda => filter(lambda.FunctionName)
  );

  await pruneDomainNames(
    (domainName) => !branchNames.some(
      branchName => aliasToName(branchName) === domainName
    )
  );

  await pruneApiGateway(
    ({ name }) => filter(name)
  );

  await pruneLoadBalancers({
    filter: ({ LoadBalancerName }) => filter(LoadBalancerName)
  });

  await pruneAliases({
    filter: (name) => !branchNames.some(branchName => branchName === name)
  });

  const stack = await ensureWebStack();

  await pruneServices({
    cluster: stack.Cluster,
    filter: ({ name }) => filter(name)
  });

  await pruneTaskDefinitions({
    filter: ({ family }) => filter(family)
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
    filter: ({ name }) => {
      const matches = name.match(new RegExp('/aws/lambda/(.*)'));
      return filter((matches && matches[1]) || name);
    }
  });
};

import { pruneStacks } from '../cloudformation/stack';
import { pruneLogGroups } from '../cloudwatchlogs/loggroup';
import { getOriginBranchNames } from '../git/branch';
import { prefix } from '../name';

const force = process.env.FORCE;

export default async () => {
  const branchNames = force ? ['live', 'test'] : Array.from(await getOriginBranchNames());

  const branchPrefixes = branchNames.map(branch => new RegExp(`${prefix}-${branch}(-|$)`));

  const matchesGlobalPrefix = (name) =>
    new RegExp(`^${prefix}-`).test(name);

  const matchesBranchPrefixes = (name) =>
    branchPrefixes.some(branchPrefix => branchPrefix.test(name));

  const filter = (name) => matchesGlobalPrefix(name) && !matchesBranchPrefixes(name);

  await pruneLogGroups({
    filter: ({ name }) => {
      const matches = name.match(new RegExp('/aws/lambda/(.*)'));
      return filter((matches && matches[1]) || name);
    }
  });

  await pruneStacks({
    filter: ({ StackName }) => filter(StackName)
  });
};

import * as winston from 'winston';
import { exec } from '../promise/child_process';

export const getOriginBranchNames = async () => {
  const { stdout } = await exec('git ls-remote --heads origin');
  winston.debug('branch: stdout', stdout);
  const branchNames = stdout.match(/refs\/heads\/.*/ig)
    .map(ref => ref.split('refs/heads/')[1]);
  winston.debug('branch: branchNames', branchNames);
  return branchNames;
};

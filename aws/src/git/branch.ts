import { exec } from '../promise/child_process';
import * as winston from 'winston';

export const getOriginBranchNames = async () => {
    const { stdout } = await exec(`git ls-remote --heads origin`);
    winston.debug('branch: stdout', stdout);
    const branchNames = stdout.match(/refs\/heads\/.*/ig)
        .map(ref => ref.split('refs/heads/')[1]);
    winston.debug('branch: branchNames', branchNames);
    return branchNames;
};
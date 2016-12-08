import * as program from 'commander';
import { config } from 'aws-sdk';
import ecrDeploy from './ecr/deploy';

config.region = "eu-west-1";

const warnAndExit = e => {
  console.error(e);
  process.exit(1);
};

program.command('ecr-deploy <image> <repo> <tag>')
  .action((image, repo, tag) => {
    ecrDeploy({ image, repo, tag })
      .catch(warnAndExit);
  });

program.parse(process.argv);

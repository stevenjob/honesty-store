import * as program from 'commander';
import { config } from 'aws-sdk';
import ecrDeploy from './ecr/deploy';
import iamSync from './iam/sync';
import { clusterList, clusterCreate } from './ecs/cluster';
import { ec2InstanceCreate } from './ec2/instance';

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

program.command('iam-sync [paths...]')
  .action((paths) => {
    iamSync({ paths })
      .catch(warnAndExit);
  });

program.command('ecs-create-cluster <cluster>')
  .action((cluster) => {
    clusterCreate(cluster)
      .catch(warnAndExit);
  });

program.command('ecs-list-cluster')
  .action(() =>
    clusterList()
      .then(console.dir)
      .catch(warnAndExit));

program.command('ec2-create-instance <cluster>')
  .action((cluster) => {
    ec2InstanceCreate({ cluster })
      .catch(warnAndExit);
  });

program.command('*')
  .action(() => {
    program.help();
  });

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}

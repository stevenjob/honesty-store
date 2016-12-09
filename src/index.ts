import * as program from 'commander';
import { config } from 'aws-sdk';
import ecrDeploy from './ecr/deploy';
import iamSync from './iam/sync';
import { clusterList, clusterCreate } from './ecs/cluster';
import { containerInstanceList } from './ecs/instance';
import { runTask } from './ecs/task/run';
import { ec2InstanceList, ec2InstanceCreate } from './ec2/instance';
import registerTaskDefinition from './ecs/task/define';
import { securityGroupCreate } from './ec2/securitygroup';

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
  .action(async (cluster) => {
    try {
      const securityGroupId = await securityGroupCreate({ name: 'open2world', open: true });

      await ec2InstanceCreate({ cluster, securityGroupId })
    } catch (e) {
      warnAndExit(e);
    }
  });

program.command('ecs-run-image <image> <cluster>')
  .action(async (image, cluster) => {
    const family = 'run-image-family';
    try {
      const taskName = await registerTaskDefinition({ image, family })

      const ec2Instances = await ec2InstanceList();

      if (ec2Instances.length == 0) {
        warnAndExit('no ec2 instances on which to run the image (use ec2-create-instance)');
      }

      let containerInstances = [];
      do {
        containerInstances = await containerInstanceList({ cluster });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } while(containerInstances.length === 0);

      const containerInstance = containerInstances[0];
      await runTask({ taskName, cluster, instance: containerInstance })
    }catch (e) {
      warnAndExit(e)
    }
  });

program.command('*')
  .action(() => {
    program.help();
  });

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}

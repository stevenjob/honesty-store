import * as program from 'commander';
import { config } from 'aws-sdk';
import ecrDeploy from './ecr/deploy';
import iamSync from './iam/sync';
import { clusterCreate } from './ecs/cluster/cluster';
import { serviceCreate } from './ecs/service';
import { ec2InstanceCreate } from './ec2/instance';
import registerTaskDefinition from './ecs/task/define';
import { securityGroupCreate } from './ec2/securitygroup';
import { basename } from 'path';

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

program.command('ec2-create-instance <cluster>')
  .description('use this to add an instance to <cluster>,\n'
               + 'which gives `ecs-run-image-with-service` more instances on which to run')
  .action(async (cluster) => {
    try {
      const securityGroupId = await securityGroupCreate({ name: 'open2world', open: true });

      await ec2InstanceCreate({ cluster, securityGroupId })
    } catch (e) {
      warnAndExit(e);
    }
  });

program.command('ecs-run-image-with-service <image> <service> <cluster>')
  .description('use this to create an auto-restarting service which will re-run <image> on <cluster>')
  .action(async (image, service, cluster) => {
    try {
      const taskDefinitionNameFamily = `task-${basename(image).replace(/:/g, '-')}`;

      const taskName = await registerTaskDefinition({ image, family: taskDefinitionNameFamily })

      await serviceCreate({ name: service, cluster, task: taskName })
    } catch (e) {
      warnAndExit(e)
    }
  });

program.command('*')
  .action(() => {
    program.help();
  });

program.on('--help', () => console.log(``
    + `Example first-time setup:\n`
    + `  ecs-create-cluster mycluster\n`
    + `  ec2-create-instance mycluster\n`
    + `\n`
    + `Example image deployment:\n`
    + `  ecr-deploy mywebimage mywebrepo latest\n`
    + `  ecs-run-image-with-service <uid>.dkr.ecr.<region>.amazonaws.com/mywebrepo:latest myservice mycluster`));

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}

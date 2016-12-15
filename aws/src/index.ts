import * as program from 'commander';
import { config } from 'aws-sdk';
import ecrDeploy from './ecr/deploy';
import iamSync from './iam/sync';
import { clusterList, clusterCreate } from './ecs/cluster/cluster';
import { serviceCreate } from './ecs/service';
import { ec2InstanceCreate } from './ec2/instance';
import registerTaskDefinition from './ecs/task/define';
import { securityGroupCreate } from './ec2/securitygroup';
import { dumpClusterInformation } from './ecs/cluster/dump'
import { dumpTaskUrls } from './ecs/task/dump'

config.region = "eu-west-1";

const taskDefinitionNameFamily = 'run-image-family';

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
      const taskName = await registerTaskDefinition({ image, family: taskDefinitionNameFamily })

      await serviceCreate({ name: service, cluster, task: taskName })
    } catch (e) {
      warnAndExit(e)
    }
  });

program.command('ecs-query-cluster <cluster>')
  .description('use this to retrieve a list of services and instances running on <cluster>')
  .action((cluster) => {
    try {
      dumpClusterInformation(cluster);
    } catch (e) {
      warnAndExit(e);
    }
  });

program.command('ecs-query')
  .description('retrieve a list of all clusters, services and instances')
  .action(async () => {
    try {
      (await clusterList()).forEach(dumpClusterInformation);
    } catch (e) {
      warnAndExit(e);
    }
  });

program.command('ecs-list-urls <cluster>')
  .description('retrieve a list of urls for all tasks in <cluster>')
  .action((cluster) => {
    try {
      dumpTaskUrls(cluster);
    } catch (e) {
      warnAndExit(e);
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
    + `  ecs-run-image-with-service <uid>.dkr.ecr.<region>.amazonaws.com/mywebrepo:latest myservice mycluster\n`
    + `\n`
    + `Example query:\n`
    + `  ecs-query-cluster mycluster\n`
    + `  ecs-query\n`
    + `  ecs-list-urls mycluster\n`
  ));

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}

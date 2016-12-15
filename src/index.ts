import * as program from 'commander';
import { config } from 'aws-sdk';
import ecrDeploy from './ecr/deploy';
import iamSync from './iam/sync';
import { clusterList, clusterCreate, clusterDescribe } from './ecs/cluster/cluster';
import { serviceCreate, serviceList, serviceDescribe } from './ecs/service';
import { containerInstanceList, containerInstanceDescribe } from './ecs/instance';
import { runTask } from './ecs/task/run';
import { ec2InstanceList, ec2InstanceCreate } from './ec2/instance';
import { taskList } from './ecs/task/list';
import { tasksDescribe } from './ecs/task/describe';
import registerTaskDefinition from './ecs/task/define';
import { securityGroupCreate } from './ec2/securitygroup';

config.region = "eu-west-1";

const taskDefinitionNameFamily = 'run-image-family';

const warnAndExit = e => {
  console.error(e);
  process.exit(1);
};

const printClusterInformation = async (clusterName) => {
  try {
    const cluster = await clusterDescribe({ cluster: clusterName })

    const serviceArnList = await serviceList({ cluster: clusterName });
    const instanceArnList = await containerInstanceList({ cluster: clusterName });

    console.log(`"${clusterName}": ${cluster.runningTasksCount} running task(s), `
                + `${serviceArnList.length} service(s), `
                + `${instanceArnList.length} instance(s)`);

    if (serviceArnList.length) {
      const services = await serviceDescribe({ services: serviceArnList, cluster: clusterName });

      for (const service of services) {
        console.log(`  service "${service.serviceName}":\n`
                    + `    status: ${service.status}\n`
                    + `    runningCount: ${service.runningCount}\n`
                    + `    taskDefinition: ${service.taskDefinition}\n`
                    + `    createdAt: ${service.createdAt}`);
      }
    }

    if (instanceArnList.length) {
      const instances = await containerInstanceDescribe({
        containerInstances: instanceArnList, cluster: clusterName
      });

      for (const instance of instances) {
        console.log(`  instance ${instance.containerInstanceArn}\n`
                    + `    ec2-instance: ${instance.ec2InstanceId}\n`
                    + `    status: ${instance.status}\n`
                    + `    runningTasksCount: ${instance.runningTasksCount}\n`
                    + `    pendingTasksCount: ${instance.pendingTasksCount}`);
      }
    }

  } catch (e) {
    warnAndExit(e);
  }
};

const printTaskUrls = async (clusterName) => {
  try {
    const taskArnList = await taskList({ cluster: clusterName });

    if (taskArnList.length === 0) {
      console.log(`<no tasks>`);
      return;
    }

    const tasks = await tasksDescribe({ tasks: taskArnList, cluster: clusterName });

    for (const task of tasks) {
      // get the container instance, resolve to an ec2 instance, get its IP, then dump network bindings
      const containerInstances = await containerInstanceDescribe({
        containerInstances: [task.containerInstanceArn],
        cluster: clusterName
      });
      const containerInstance = containerInstances[0];

      const ec2Instances = await ec2InstanceList({ instanceIds: [ containerInstance.ec2InstanceId ] });
      const ec2Instance = ec2Instances[0];

      const networkBindings = task.containers
        .map((container) => container.networkBindings)
        .reduce((result, bindings) => result.concat(bindings), []);

      // note: http assumed
      networkBindings.forEach((networkBinding) =>
        console.log(`http://${ec2Instance.PublicDnsName}:${networkBinding.hostPort}/`));
    }
  } catch (e) {
    warnAndExit(e);
  }
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
  .action(printClusterInformation);

program.command('ecs-query')
  .description('retrieve a list of all clusters, services and instances')
  .action(async () => {
    try {
      (await clusterList()).forEach(printClusterInformation);
    } catch (e) {
      warnAndExit(e);
    }
  });

program.command('ecs-list-urls <cluster>')
  .description('retrieve a list of urls for all tasks in <cluster>')
  .action(printTaskUrls);

program.command('*')
  .action(() => {
    program.help();
  });

program.on('--help', () => console.log(``
    + `Example first-time setup:\n`
    + `  ec2-create-cluster mycluster\n`
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

import * as program from 'commander';
import { config } from 'aws-sdk';
import iamSync from './iam/sync';
import { clusterCreate } from './ecs/cluster';
import { ec2InstanceCreate } from './ec2/instance';
import { securityGroupCreate } from './ec2/securitygroup';
import deploy from './script/deploy';
import prune from './script/prune';
import { createLocalDatabase } from './script/local';
import * as winston from 'winston';

winston.configure({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      timestamp() {
        return Date.now();
      },
      formatter(options) {
        return `${new Date(options.timestamp()).toISOString()} ${options.level.toUpperCase()} ${options.message} ${JSON.stringify(options.meta)}`;
      }
    })
  ]
});

config.region = "eu-west-1";

const warnAndExit = e => {
  console.error(e);
  process.exit(1);
};

program.command('deploy <branch> [dirs...]')
  .action((branch, dirs) => {
    deploy({ branch, dirs })
      .catch(warnAndExit);
  });

program.command('prune')
  .action(() => {
    prune()
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
  .description('use this to add an ec2 instance to <cluster>')
  .action(async (cluster) => {
    try {
      const securityGroupId = await securityGroupCreate({ name: 'open2world', open: true });

      await ec2InstanceCreate({ cluster, securityGroupId })
    } catch (e) {
      warnAndExit(e);
    }
  });

program.command('local-db <table-name>')
  .description('use this to create a table in a local instance of dynamodb')
  .action((tableName) => {
    (<any>config).endpoint = 'http://localhost:8000/';
    createLocalDatabase({ tableName })
        .then(console.log)
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

#!/usr/bin/env node
const program = require('commander');
const execSync = require('child_process').execSync;

const serviceDirs = ['api', 'scripts', 'box', 'support', 'user', 'topup', 'store', 'transaction', 'test',
  'survey', 'item', 'batch', 'service', 'transaction-slack', 'transaction-store', 'cruft'];
const otherDirs = ['aws', 'web'];

const cleanAll = () => {
  console.log('Removing node modules');
  execSync('rm -rf */node_modules');
  console.log('Removing lib folders');
  execSync('rm -rf */lib');
  console.log(`Cleaning yarn's cache`);
  execSync('yarn cache clean');
};

const updateServicePackageDependencies = (cmd) => {
  for (const serviceDir of serviceDirs) {
    console.log(`Updating file dependencies of @honesty-store/${serviceDir}`);
    const dependencies = require(`./${serviceDir}/package.json`).dependencies || {};

    const fileDependencies = Object.keys(dependencies)
      .map((dep) => {
        const matches = /^@honesty-store\/\w+/.exec(dep) || [];
        return matches.length > 0 ? matches[0] : null
      })
      .filter((el) => el != null);

    fileDependencies.forEach((dep) => {
      try {
        execSync(`(cd ${serviceDir} && yarn ${cmd} "${dep}")`);
      }
      catch (e) {
        console.warn(e.message);
      }
    });
  }
};

const updateServicePackages = (cmd) => {
  for (const serviceDir of serviceDirs) {
    console.log(`Performing ${cmd} in ${serviceDir}`);
    try {
      execSync(`(cd ${serviceDir} && yarn ${cmd})`);
    } catch (e) {
      console.warn(e.message);
    }
  }
};

program.command('clean-all')
  .description(`Removes node_modules, lib folders and clears yarn's cache`)
  .action(cleanAll);

program.command('clean-hs')
  .description('Removes any packages with prefix "@honesty-store" from cache')
  .action(() => {
    const cacheDirPath = execSync('yarn cache dir').toString();
    const hsDir = 'npm-@honesty-store';
    const hsDirPath = `${cacheDirPath.trim()}/${hsDir}`;
    execSync(`rm -rf ${hsDirPath}`);
  });

program.command('install')
  .description('Installs dependencies for all sub-packages in the honesty.store mono-repo')
  .action((options) => {
    const packages = [...serviceDirs, ...otherDirs];

    for (const package of packages) {
      console.log(`Installing dependencies for ${package}`);
      execSync(`(cd ${package} && yarn install)`);
    }
  });

program.command('link')
  .description('Links all service packages to enable development without having to re-install updated packages')
  .action(() => {
    const cmd = 'link';
    updateServicePackages(cmd);
    updateServicePackageDependencies(cmd);
  });

program.command('unlink')
  .description('Unlinks all service packages')
  .action(() => {
    const cmd = 'unlink';
    updateServicePackageDependencies(cmd);
    updateServicePackages(cmd);
    console.log('All file dependencies updated. Use "bootstrap.js install" to re-install the previously linked packages')
  });

program.command('*')
  .action(() => {
    program.help();
  });

program.parse(process.argv);


if (program.args.length === 0) {
  program.help();
}

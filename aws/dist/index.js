"use strict";
const program = require("commander");
const aws_sdk_1 = require("aws-sdk");
const deploy_1 = require("./ecr/deploy");
const sync_1 = require("./iam/sync");
aws_sdk_1.config.region = "eu-west-1";
const warnAndExit = e => {
    console.error(e);
    process.exit(1);
};
program.command('ecr-deploy <image> <repo> <tag>')
    .action((image, repo, tag) => {
    deploy_1.default({ image, repo, tag })
        .catch(warnAndExit);
});
program.command('iam-sync [paths...]')
    .action((paths) => {
    sync_1.default({ paths })
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

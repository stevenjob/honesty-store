/*
Work in progress, trying to emulate the after_success section of
https://gist.github.com/BretFisher/14cd228f0d7e40dae085
in Node.js rather than shell.

Hoping to ultimately use it to automagically deploy the web repo's PRs to ECS.

Currently requires this IAM policy (probably doesn't need all of it).

Maybe it's a good idea to encode the IAM policies in this repo???

{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "1",
            "Effect": "Allow",
            "Action": [
                "ecr:BatchCheckLayerAvailability",
                "ecr:CompleteLayerUpload",
                "ecr:DescribeRepositories",
                "ecr:GetRepositoryPolicy",
                "ecr:InitiateLayerUpload",
                "ecr:ListImages",
                "ecr:PutImage",
                "ecr:UploadLayerPart"
            ],
            "Resource": [
                "arn:aws:ecr:eu-west-1:812374064424:repository/crap*"
            ]
        },
        {
            "Sid": "2",
            "Effect": "Allow",
            "Action": [
                "ecr:CreateRepository",
                "ecr:GetAuthorizationToken",
                "iam:GetUser"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
*/
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const aws_sdk_1 = require("aws-sdk");
const child_process_1 = require("child_process");
const getAccountId = () => __awaiter(this, void 0, void 0, function* () {
    const response = yield new aws_sdk_1.IAM({ apiVersion: '2010-05-08' })
        .getUser()
        .promise();
    const [arn, partition, service, region, accountId] = response.User.Arn.split(':');
    return accountId;
});
const getCredentials = () => __awaiter(this, void 0, void 0, function* () {
    const response = yield new aws_sdk_1.ECR({ apiVersion: '2015-09-21' })
        .getAuthorizationToken()
        .promise();
    const token = response.authorizationData[0].authorizationToken;
    const decodedToken = Buffer.from(token, 'base64').toString('utf8');
    const [user, password] = decodedToken.split(':');
    return { user, password };
});
const ensureRepoExists = (repo) => __awaiter(this, void 0, void 0, function* () {
    try {
        const response = yield new aws_sdk_1.ECR({ apiVersion: '2015-09-21' })
            .describeRepositories({ repositoryNames: [repo] })
            .promise();
    }
    catch (e) {
        if (e.code !== 'RepositoryNotFoundException') {
            throw e;
        }
        const response = yield new aws_sdk_1.ECR({ apiVersion: '2015-09-21' })
            .createRepository({ repositoryName: repo })
            .promise();
        console.log(`Created ${response.repository.repositoryArn}`);
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ image, repo, tag }) => __awaiter(this, void 0, void 0, function* () {
    const [accountId, { user, password }] = yield Promise.all([getAccountId(), getCredentials(), ensureRepoExists(repo)]);
    const registry = `${accountId}.dkr.ecr.${aws_sdk_1.config.region}.amazonaws.com`;
    child_process_1.execSync(`docker login -u ${user} -p ${password} -e none https://${registry}`);
    child_process_1.execSync(`docker tag ${image}:latest ${registry}/${repo}:${tag} `);
    child_process_1.execSync(`docker push ${registry}/${repo}:${tag} `);
    console.log(`Image ${image} deployed to ${repo} with tag ${tag}`);
    return `https://${registry}/${repo}:${tag}`;
});

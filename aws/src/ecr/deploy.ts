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

import { ECR, IAM, config } from 'aws-sdk';
import { execSync } from 'child_process';
import { awsCheckFailures } from '../failure';

const getAccountId = async () => {
  const response = await new IAM({ apiVersion: '2010-05-08' })
    .getUser()
    .promise();
  const [ arn, partition, service, region, accountId ] = response.User.Arn.split(':');
  return accountId;
}

const getCredentials = async () => {
  const response = await new ECR({ apiVersion: '2015-09-21' })
    .getAuthorizationToken()
    .promise();
  const token = response.authorizationData[0].authorizationToken;
  const decodedToken = Buffer.from(token, 'base64').toString('utf8');
  const [ user, password ] = decodedToken.split(':');
  return { user, password };
};

const ensureRepoExists = async (repo) => {
  try {
    const response = await new ECR({ apiVersion: '2015-09-21' })
      .describeRepositories({ repositoryNames: [ repo ] })
      .promise();

    awsCheckFailures(response);
  }
  catch (e) {
    if (e.code !== 'RepositoryNotFoundException') {
      throw e;
    }
    const response = await new ECR({ apiVersion: '2015-09-21' })
      .createRepository({ repositoryName: repo })
      .promise();
    console.log(`Created ${response.repository.repositoryArn}`);
  }
};

export default async ({ image, repo, tag }) => {
  const [accountId, { user, password }] =
    await Promise.all([getAccountId(), getCredentials(), ensureRepoExists(repo)]);
  const registry = `${accountId}.dkr.ecr.${config.region}.amazonaws.com`;
  execSync(`docker login -u ${user} -p ${password} -e none https://${registry}`);
  execSync(`docker tag ${image}:latest ${registry}/${repo}:${tag} `);
  execSync(`docker push ${registry}/${repo}:${tag} `);
  console.log(`Image ${image} deployed to ${repo} with tag ${tag}`);
  return `https://${registry}/${repo}:${tag}`;
};

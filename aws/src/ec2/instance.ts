import { EC2 } from 'aws-sdk';
import { throwUnlessClusterExists } from '../ecs/cluster';

/*
requires:
"Action": [
  "ec2:RunInstances",
  "iam:PassRole",
  "iam:ListInstanceProfiles"
],
"Resource": [
  "arn:aws:ec2:*:*",
  "arn:aws:ecs:*",
  "arn:aws:iam::*:*"
]
*/
export const ec2InstanceCreate = async ({ cluster, securityGroupId }) => {
  await throwUnlessClusterExists({ cluster });

  const runInstanceRequest = {
    // amazon docker machine image, see http://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-optimized_AMI.html
    ImageId: 'ami-e3fbd290',

    // need to connect this instance to the cluster using the ecs-agent http://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-agent-config.html
    UserData: Buffer.from(`#!/bin/sh\necho ECS_CLUSTER=${cluster} > /etc/ecs/ecs.config\n`).toString('base64'),

    // the instance profile created by our IAM script
    IamInstanceProfile: {
      Name: 'ecsInstanceRole'
    },

    InstanceType: 't2.micro',
    MinCount: 1,
    MaxCount: 1,

    SecurityGroupIds: [ securityGroupId ]
  };

  const response = await new EC2({ apiVersion: '2016-11-15' })
    .runInstances(runInstanceRequest)
    .promise();

  return response.Instances;
}

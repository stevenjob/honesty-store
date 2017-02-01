import { EC2 } from 'aws-sdk';

/*
requires:
"Action": [
  "ec2:DescribeSecurityGroups",
  "ec2:CreateSecurityGroup",
  "ec2:AuthorizeSecurityGroupIngress"
],
*/

const openUp = async ({ groupId }) => {
  const ingress = {
    GroupId: groupId,

    IpPermissions: [
      {
        // all protocols, all ports
        IpProtocol: '-1',
        FromPort: -1,
        ToPort: -1,
        IpRanges: [
          {
            CidrIp: '0.0.0.0/0'
          }
        ]
      }
    ]
  };

  await new EC2({ apiVersion: '2014-11-13' })
    .authorizeSecurityGroupIngress(ingress)
    .promise();
};

const createNewGroup = async ({ name, open }) => {
  const group = {
    GroupName: name,
    Description: name
  };

  const response = await new EC2({ apiVersion: '2016-11-15' })
    .createSecurityGroup(group)
    .promise();

  const groupId = response.GroupId;

  if (open) {
    await openUp({ groupId });
  }

  return groupId;
};

export const securityGroupCreate = async ({ name, open }) => {
  try {
    const existingGroups = await new EC2({ apiVersion: '2014-11-13' })
      .describeSecurityGroups({ GroupNames: [ name ] })
      .promise();

    return existingGroups.SecurityGroups[0].GroupId;

  } catch (e) {
    if (e.code !== 'InvalidGroup.NotFound') {
      throw e;
    }

    return await createNewGroup({ name, open });
  }
};

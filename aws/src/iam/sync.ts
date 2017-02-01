import { IAM } from 'aws-sdk';
import { readFileSync } from 'fs';
import { basename, extname } from 'path';

const iam = new IAM({ apiVersion: '2010-05-08' });

const updatePolicy = async ({ arn, versionId, document }) => {
  const existingPolicyVersionResponse = await iam.getPolicyVersion({
    PolicyArn: arn,
    VersionId: versionId
  })
    .promise();
  // URI decoding is required - https://github.com/aws/aws-sdk-java/issues/730
  const existingDocument = decodeURIComponent(existingPolicyVersionResponse.PolicyVersion.Document);
  if (existingDocument !== document) {
    await iam.createPolicyVersion({
      PolicyArn: arn,
      PolicyDocument: document,
      SetAsDefault: true
    })
      .promise();
    await iam.deletePolicyVersion({
      PolicyArn: arn,
      VersionId: versionId
    })
      .promise();
  }
};

const deletePolicy = async ({ arn }) => {
  const policyVersionsResponse = await iam.listPolicyVersions({ PolicyArn: arn })
    .promise();
  const nonDefaultVersions = policyVersionsResponse.Versions
    .filter(version => !version.IsDefaultVersion);
  for (const version of nonDefaultVersions) {
    await iam.deletePolicyVersion({
      PolicyArn: arn,
      VersionId: version.VersionId
    })
      .promise();
  }
  await iam.deletePolicy({ PolicyArn: arn })
    .promise();
};

export default async ({ paths }) => {

  const policiesResponse = await iam.listPolicies({ Scope: 'Local' })
    .promise();

  if (policiesResponse.IsTruncated) {
    throw new Error('Code doesn\'t yet support paging');
  }

  const policies = [
    ...policiesResponse.Policies.map(policy => ({
      name: policy.PolicyName,
      type: 'remote',
      data: policy
    })),
    ...paths.map(path => {
      if (extname(path) !== '.json') {
        throw new Error(`Invalid path ${path}`);
      }
      return {
        name: basename(path, '.json'),
        type: 'local',
        data: readFileSync(path, 'utf8')
      };
    })
  ]
    .reduce((pols, {name, type, data}) => {
      const policy = pols[name] || {};
      policy[type] = data;
      pols[name] = policy;
      return pols;
    // tslint:disable-next-line:align
    }, {});

  for (const name of Object.keys(policies)) {
    const policy = policies[name];

    if (policy.local != null && policy.remote == null) {
      await iam.createPolicy({
        PolicyName: name,
        PolicyDocument: policy.local
      })
        .promise();
    } else if (policy.local != null && policy.remote != null) {
      await updatePolicy({
        arn: policy.remote.Arn,
        versionId: policy.remote.DefaultVersionId,
        document: policy.local
      });
    } else if (policy.local == null && policy.remote != null) {
      await deletePolicy({
        arn: policy.remote.Arn
      });
    } else {
      throw new Error('Invalid state');
    }
  }
};

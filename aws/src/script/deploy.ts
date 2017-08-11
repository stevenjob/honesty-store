import { config, S3 } from 'aws-sdk';
import { readFileSync } from 'fs';
import * as winston from 'winston';
import { ensureStack } from '../cloudformation/stack';
import { zip } from '../lambda/function';
import { isLive, generateName } from '../name';
import { aliasToBaseUrl, aliasToName } from '../route53/alias';
import { tableExists } from '../dynamodb/table';

const templateBucket = 'honesty-store-templates';

interface DirConfig {
  path: string;
  pattern: string;
}

const dirs: DirConfig[] = [
  { path: 'item', pattern: 'lib/bundle-min.js' },
  { path: 'store', pattern: 'lib/bundle-min.js' },
  { path: 'transaction', pattern: 'lib/bundle-min.js' },
  { path: 'topup', pattern: 'lib/bundle-min.js' },
  { path: 'user', pattern: 'lib/bundle-min.js' },
  { path: 'api', pattern: 'lib/bundle-min.js' },
  { path: 'web', pattern: '{node_modules,server,build}/**/*' },
  { path: 'transaction-store', pattern: 'lib/bundle-min.js' }
];

const getAndAssertEnvironment = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`$${key} not present in environment`);
  }
  return value;
};

const generateStripeKey = ({ branch, type }) => {
  if (isLive(branch) && type === 'live') {
    return getAndAssertEnvironment('LIVE_STRIPE_KEY');
  }
  return getAndAssertEnvironment('TEST_STRIPE_KEY');
};

const generateSecret = ({ secretPrefix, branch, liveSecret }) => {
  const bareSecret = () => {
    if (isLive(branch)) {
      return liveSecret;
    }
    return branch;
  };

  return `${secretPrefix}:${bareSecret()}`;
};

const getCertificateArn = ({ branch }) => isLive(branch) ?
  'arn:aws:acm:us-east-1:812374064424:certificate/8f1b6ff9-f215-4c9c-8a14-04a2aab84004' :
  'arn:aws:acm:us-east-1:812374064424:certificate/952d48cc-77bc-4736-b398-c5451e7dc970';

const s3Upload = async ({ content, bucket, key }) => {
  const s3 = new S3();

  try {
    await s3.headBucket({
      Bucket: bucket
    })
      .promise();
  } catch (e) {
    if (e.code !== 'NotFound') {
      throw e;
    }

    await s3.createBucket({
      Bucket: bucket
    })
      .promise();
  }

  return await s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: content
  })
    .promise();
};

const listExistingTables = async ({ dirs, branch }: { dirs: string[], branch: string }) =>
  await Promise.all(
    dirs.map(
      async path => ({
        path,
        exists: await tableExists(generateName({ branch, dir: path }))
      })
    )
  );

// TODO: doesn't remove resources left over when a dir is deleted until the branch is deleted
export default async ({ branch }) => {
  const serviceSecret = generateSecret({
    secretPrefix: 'service',
    branch,
    liveSecret: getAndAssertEnvironment('LIVE_SERVICE_TOKEN_SECRET')
  });
  const userSecret = generateSecret({
    secretPrefix: 'user',
    branch,
    liveSecret: getAndAssertEnvironment('LIVE_USER_TOKEN_SECRET')
  });

  const baseUrl = aliasToBaseUrl(branch);

  winston.info(`s3Upload() for per-service json...`);
  await s3Upload({
    content: readFileSync(`${__dirname}/../../cloudformation/web-cluster-per-service.json`, 'utf8'),
    bucket: `${templateBucket}-${config.region}`,
    key: 'per-service.json'
  });

  for (const { path, pattern } of dirs) {
    winston.info(`s3Upload() for ${path}...`);

    const zipFile = await zip(path, pattern);
    await s3Upload({
      content: zipFile,
      bucket: `honesty-store-lambdas-${config.region}`,
      key: `${path}.zip`
    });
  }

  const existingTableKeys = (await listExistingTables({
    dirs: dirs.map(({ path }) => path),
    branch
  }))
    .reduce((acc, { path, exists }) => {
      const key = `CreateTable${path}`;
      acc[key] = exists;
      return acc;
    },
    {});

  const stackName = `stack-${branch}`;
  winston.info(`ensureStack('${stackName}')...`);
  await ensureStack({
    name: stackName,
    templateName: `${__dirname}/../../cloudformation/web-cluster.json`,
    params: {
      CertificateArn: getCertificateArn(branch),
      HSDomainName: aliasToName(branch),
      ServiceSecret: serviceSecret,
      UserSecret: userSecret,
      ServicePrefix: isLive(branch) ? 'honesty-store' : `hs-${branch}`,
      HSPrefix: isLive(branch) ? 'honesty-store' : 'hs',
      StripeKeyLive: generateStripeKey({ branch, type: 'live' }),
      StripeKeyTest: generateStripeKey({ branch, type: 'test' }),
      IsLive: isLive(branch) ? 'Yes' : 'No',
      ...existingTableKeys
    }});

  winston.info(`Deployed to ${baseUrl}`);
};

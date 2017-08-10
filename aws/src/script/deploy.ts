import * as winston from 'winston';
import { aliasToBaseUrl } from '../route53/alias';
import { zip } from '../lambda/function';
import { aliasToName } from '../route53/alias';
import { ensureStack } from '../cloudformation/stack';
import { config, S3 } from 'aws-sdk';
import { readFileSync } from 'fs';

export const prefix = 'hs';

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
  { path: 'transaction-slack', pattern: 'lib/bundle-min.js' },
  { path: 'transaction-store', pattern: 'lib/bundle-min.js' },
];

export const isLive = (branch) => branch === 'live';

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

// TODO: doesn't remove resources left over when a dir is deleted until the branch is deleted
export default async ({ branch }) => {
  if (isLive(branch)) {
    console.error("Refusing to run on live");
    while(1){
      process.exit(5);
    }
  }

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

  console.log(`s3Upload() for per-service json...`);
  await s3Upload({
    content: readFileSync(`${__dirname}/../../cloudformation/web-cluster-per-service.json`, 'utf8'),
    bucket: `${templateBucket}-${config.region}`,
    key: 'per-service.json'
  });

  const doZips = true;

  for (const { path, pattern } of dirs) {
    console.log(`s3Upload() for ${path}...`);
    if(doZips){
      const zipFile = await zip(path, pattern);
      await s3Upload({
        content: zipFile,
        bucket: `honesty-store-lambdas-${config.region}`,
        key: `${path}.zip`
      });
    }
  }

  console.log(`ensureStack('stack-${branch}', ...)...`);
  await ensureStack({
    name: `stack-${branch}`,
    templateName: `${__dirname}/../../cloudformation/web-cluster.json`,
    params: {
      CertificateArn: getCertificateArn(branch),
      HSDomainName: aliasToName(branch),
      ServiceSecret: serviceSecret,
      UserSecret: userSecret,
      ServicePrefix: isLive(branch) ? 'honesty-store' : `hs-${branch}`,
      HSPrefix: isLive(branch) ? 'honesty-store' : 'hs',
      StripeKeyLive: generateStripeKey({ branch, type: 'live' }),
      StripeKeyTest: generateStripeKey({ branch, type: 'test' })
    }});


  // TODO: dummy data in the db

  winston.info(`Deployed to ${baseUrl}`);
};

import * as winston from 'winston';
import { aliasToBaseUrl } from '../route53/alias';
import { aliasToName } from '../route53/alias';
import { ensureStack } from '../cloudformation/stack';

export const prefix = 'hs';

const isLive = (branch) => branch === 'live';

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

  await ensureStack({
    name: `stack-${branch}`,
    templateName: `${__dirname}/../../cloudformation/web-cluster.json`,
    params: {
      StageName: branch,
      CertificateArn: getCertificateArn(branch),
      DomainName: aliasToName(branch),
      ServiceSecret: serviceSecret,
      UserSecret: userSecret,
      HonestyStorePrefix: isLive(branch) ? 'honesty-store' : `hs-${branch}`,
      StripeKeyLive: generateStripeKey({ branch, type: 'live' }),
      StripeKeyTest: generateStripeKey({ branch, type: 'test' })
    }});


  // TODO: dummy data in the db

  winston.info(`Deployed to ${baseUrl}`);
};

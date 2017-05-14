import { DynamoDB } from 'aws-sdk';
import * as winston from 'winston';
import { ensureDomainName, ensureLambdaMethod, ensureResource, ensureRestApi } from '../apigateway/gateway';
import { ensureStack } from '../cloudformation/stack';
import { ensureTable } from '../dynamodb/table';
import { ensureFunction } from '../lambda/function';
import { aliasToBaseUrl, ensureAlias } from '../route53/alias';
import dirToTable from '../table/tables';

export const prefix = 'hs';

export const ensureWebStack = async () =>
  await ensureStack({
    name: 'web-cluster',
    templateName: `${__dirname}/../../cloudformation/web-cluster.json`,
    params: {
      AmiImageId: 'ami-a7f2acc1',
      SubnetACidrBlock: '10.1.0.0/24',
      SubnetBCidrBlock: '10.1.1.0/24',
      SubnetCCidrBlock: '10.1.2.0/24',
      VpcCidrBlock: '10.1.0.0/16'
    }});

interface LambdaConfig {
  [key: string]: {
    database?: 'ro' | 'rw';
    handler?: string;

    withStripe?: boolean;
    withUserSecret?: boolean;

    catchAllResource?: boolean;
  };
}

const lambdaConfig: LambdaConfig = {
  item: {
    database: 'ro'
  },
  box: {
    database: 'rw'
  },
  batch: {
    database: 'ro'
  },
  store: {
    database: 'ro'
  },
  survey: {
    database: 'rw'
  },
  transaction: {
    database: 'rw'
  },
  topup: {
    database: 'rw',
    withStripe: true
  },
  user: {
    database: 'rw',
    withUserSecret: true
  },
  api: {
  },
  web: {
    handler: 'server/lambda.handler',
    catchAllResource: true
  }
};

const isLive = (branch) => branch === 'live';

const generateName = ({ branch, dir }: { branch: string, dir?: string }) => {
  const base = isLive(branch) ? 'honesty-store' : `${prefix}-${branch}`;
  return dir == null ? base : `${base}-${dir}`;
};

const ensureDatabase = async ({ branch, dir }) => {
  const capacityUnits = 1;

  const { config, data } = dirToTable({
    dir,
    readCapacityUnits: capacityUnits,
    writeCapacityUnits: capacityUnits
  });
  return await ensureTable({
    config: {
      ...config,
      TableName: generateName({ branch, dir })
    },
    data
  });
};

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

const createApiGatewayResource = async ({ restApi, dir, catchAllResource }) => {
  if (catchAllResource) {
    return await ensureResource({
      restApi,
      path: '{proxy+}',
      parentPath: '/'
    });
  }

  await ensureResource({
    restApi,
    path: dir,
    parentPath: '/'
  });

  return await ensureResource({
    restApi,
    path: '{proxy+}',
    parentPath: `/${dir}`
  });
};

const setupApiGateway = async ({ restApi, dir, lambdaArn, catchAllResource }) => {
  const resource = await createApiGatewayResource({ restApi, dir, catchAllResource });

  await ensureLambdaMethod({
    restApi,
    serviceName: dir,
    lambdaArn,
    resource
  });
};

const getCertificateArn = ({ branch }) => isLive(branch) ?
  'arn:aws:acm:us-east-1:812374064424:certificate/8f1b6ff9-f215-4c9c-8a14-04a2aab84004' :
  'arn:aws:acm:us-east-1:812374064424:certificate/952d48cc-77bc-4736-b398-c5451e7dc970';

// TODO: doesn't remove resources left over when a dir is deleted until the branch is deleted
export default async ({ branch, dirs }) => {
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

  const restApi = await ensureRestApi({ name: generateName({ branch }) });

  const customDomain = await ensureDomainName({
    restApi,
    alias: branch,
    certificateArn: getCertificateArn({ branch })
  });

  await ensureAlias({
    alias: branch,
    value: customDomain.distributionDomainName
  });

  for (const dir of dirs) {
    if (!lambdaConfig[dir]) {
      continue;
    }

    let db: DynamoDB.TableDescription = null;
    if (lambdaConfig[dir].database) {
      db = await ensureDatabase({ branch, dir });
    }

    const lambda = await ensureFunction({
      name: generateName({ branch, dir }),
      codeDirectory: dir,
      codeFilter: path => /(lib|node_modules|server|public)/.test(path),
      handler: lambdaConfig[dir].handler || `lib/${dir}/src/lambda.handler`,
      dynamoAccess: lambdaConfig[dir].database,
      withApiGateway: true,
      live: isLive(branch),
      environment: {
        TABLE_NAME: db && db.TableName,
        BASE_URL: baseUrl,
        LAMBDA_BASE_URL: baseUrl,
        SERVICE_TOKEN_SECRET: serviceSecret,
        USER_TOKEN_SECRET: lambdaConfig[dir].withUserSecret && userSecret,
        LIVE_STRIPE_KEY: lambdaConfig[dir].withStripe && generateStripeKey({ branch, type: 'live' }),
        TEST_STRIPE_KEY: lambdaConfig[dir].withStripe && generateStripeKey({ branch, type: 'test' })
      }
    });

    await setupApiGateway({
      restApi,
      dir,
      lambdaArn: lambda.FunctionArn,
      catchAllResource: lambdaConfig[dir].catchAllResource
    });
  }

  winston.info(`Deployed to ${baseUrl}`);
};

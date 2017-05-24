import { APIGateway, config } from 'aws-sdk';
import * as winston from 'winston';
import ms = require('ms');
import { aliasToName } from '../route53/alias';

interface NestedRestApi {
  restApi: APIGateway.RestApi;
}
interface NestedResourceId {
  resourceId: string;
}
type IntegrationParams =
  NestedRestApi &
  NestedResourceId &
  {
    restMethod: APIGateway.Method;
    lambdaArn: string;
  };

const assumedLimit = 200;
const stageName = 'live';

const getRestApis = async () => {
  const restApis = await new APIGateway({ apiVersion: '2015-07-09' })
    .getRestApis({ limit: assumedLimit })
    .promise();

  return restApis.items;
};

const makeRetryable = request => {
  /*
   * Action            Limit
   * ---------------------------------------------------------------------------
   * CreateRestApi     2 requests per minute per account.
   * DeleteRestApi     2 requests per minute per account
   * CreateDeployment  3 requests per minute per account
   * GetResources      150 requests per minute per account
   * CreateResource    300 requests per minute per account
   * Total operations  10 request per second (rps) with a burst limit of 40 rps.
   *
   * handle TooManyRequestsException - https://github.com/aws/aws-sdk-js/issues/1014
   */
  const retryDelay = ms('60s');

  request.on('extractError', ({ error }) => {
    if (error.code === 'TooManyRequestsException') {
      error.retryable = true;
    }
  });
  request.on('retry', ({ error }) => {
    if (error.code === 'TooManyRequestsException') {
      error.retryable = true;
      error.retryDelay = retryDelay;
      winston.debug(`apigateway: request failed, retrying in ${error.retryDelay}ms`, { error });
    }
  });

  return request;
};

interface CreateDomainNameRequest extends APIGateway.CreateDomainNameRequest {
  certificateArn: string;
}

export const ensureDomainName = async ({ restApi, alias, certificateArn }:
  { restApi: APIGateway.RestApi, alias: string, certificateArn: string }): Promise<APIGateway.DomainName> => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  const name = aliasToName(alias);

  const domainNames = await apigateway.getDomainNames({ limit: assumedLimit })
    .promise();

  const found = domainNames.items.find(domainName => domainName.domainName === name);

  if (found) {
    winston.debug(`apigateway: found domainName (lazily assuming basePathMapping exists)`, found);

    return found;
  }

  winston.debug(`apigateway: couldn't find domainName ${name}`);

  const domainName = await apigateway.createDomainName(<CreateDomainNameRequest>{
    certificateArn,
    domainName: name
  })
    .promise();

  winston.debug(`apigateway: createDomainName`, domainName);

  const basePathMapping = await apigateway.createBasePathMapping({
    domainName: name,
    basePath: '',
    restApiId: restApi.id,
    stage: stageName
  })
    .promise();

  winston.debug(`apigateway: createBasePathMapping`, basePathMapping);

  return domainName;
};

const replaceBinaryMediaTypes = async ({ apigateway, restApi, binaryMediaTypes }) => {
  const existingTypes = restApi.binaryMediaTypes || [];
  const desiredTypes = binaryMediaTypes;

  const toRemove = existingTypes.filter(existingType => desiredTypes.indexOf(existingType) === -1);
  const toAdd = desiredTypes.filter(candidate => existingTypes.indexOf(candidate) === -1);

  const escapeType = type => type.replace('/', '~1');

  winston.debug(`apigateway: binaryMediaTypes removing:`, toRemove);
  winston.debug(`apigateway: binaryMediaTypes adding:`, toAdd);

  const patchOperations = [
    ...toRemove.map(type => ({
      op: 'replace',
      path: '/binaryMediaTypes/' + escapeType(type)
    })),
    ...toAdd.map(type => ({
      op: 'add',
      path: '/binaryMediaTypes/' + escapeType(type),
      value: type
    }))
  ];

  if (patchOperations.length === 0) {
    return;
  }

  await makeRetryable(apigateway.updateRestApi({
    restApiId: restApi.id,
    patchOperations
  })).promise();
};

export const ensureRestApi = async ({ name }): Promise<APIGateway.RestApi> => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  const restApis = await getRestApis();

  const found = restApis.find(restApi => restApi.name === name);

  const binaryMediaTypes = [
    'application/font-woff',
    'application/font-woff2',
    'application/javascript',
    'application/json',
    'application/octet-stream',
    'application/xml',
    'font/eot',
    'font/opentype',
    'font/otf',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/x-icon',
    'text/comma-separated-values',
    'text/css',
    'text/html',
    'text/javascript',
    'text/plain',
    'text/text',
    'text/xml',
    '*/*'
  ];

  if (found) {
    winston.debug(`apigateway: found restApi`, found);

    await replaceBinaryMediaTypes({ apigateway, restApi: found, binaryMediaTypes });

    return found;
  }

  winston.debug(`apigateway: couldn't find '${name}'`);

  const response = await makeRetryable(apigateway.createRestApi({ name, binaryMediaTypes })).promise();

  winston.debug(`apigateway: createRestApi`, response);

  return response;
};

export const ensureResource = async ({ restApi, path, parentPath }): Promise<APIGateway.Resource> => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  const resources = await apigateway.getResources({
    restApiId: restApi.id,
    limit: assumedLimit
  })
    .promise();

  const expectedPath = `${parentPath}/${path}`.replace(/\/\//g, '/');
  const existingResource = resources.items.find(resource => resource.path === expectedPath);
  if (existingResource) {
    winston.debug(`apigateway: found existing resource`, existingResource);
    return existingResource;
  }

  winston.debug(`apigateway: couldn't find '${path}' resource, creating...`, resources.items);

  const parentIds = resources.items
    .filter(resource => resource.path === parentPath);

  if (parentIds.length !== 1) {
    throw new Error(`too many (${parentIds.length}) parentIds for path=${path} parentPath=${parentPath}`);
  }

  const parentId = parentIds[0].id;

  const response = await makeRetryable(apigateway.createResource({
    restApiId: restApi.id,
    parentId,
    pathPart: path
  }))
    .promise();

  winston.debug(`apigateway: createResource`, response);

  return response;
};

const ensureProxyMethod = async ({ restApi, resourceId }: NestedRestApi & NestedResourceId) => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  try {
    const response = await makeRetryable(apigateway.putMethod({
      restApiId: restApi.id,
      resourceId: resourceId,
      httpMethod: 'ANY',
      authorizationType: 'NONE'
    }))
      .promise();

    winston.debug(`apigateway: putMethod`, response);

    return response;
  } catch (e) {
    if (e.code !== 'ConflictException') {
      throw e;
    }

    // nothing to update
    const response = await apigateway.getMethod({
      restApiId: restApi.id,
      resourceId: resourceId,
      httpMethod: 'ANY'
    })
      .promise();

    winston.debug(`apigateway: getMethod`, response);

    return response;
  }
};

const ensureIntegration = async ({ restApi, resourceId, lambdaArn }: IntegrationParams) => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  try {
    const response = await makeRetryable(apigateway.putIntegration({
      restApiId: restApi.id,
      resourceId: resourceId,
      httpMethod: 'ANY',
      integrationHttpMethod: 'POST',
      contentHandling: 'CONVERT_TO_BINARY',
      type: 'AWS_PROXY',
      uri: `arn:aws:apigateway:${config.region}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`,
      credentials: null
    }))
      .promise();

    winston.debug(`apigateway: putIntegration`, response);

    return response;
  } catch (e) {
    if (e.code !== 'ResourceConflictException') {
      throw e;
    }

    const response = await makeRetryable(apigateway.updateIntegration({
      restApiId: restApi.id,
      resourceId: resourceId,
      httpMethod: 'ANY'
    }))
      .promise();

    winston.debug(`apigateway: updateIntegration`, response);

    return response;
  }
};

const ensureDeployment = async ({ restApi }) => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });
  const description = `${restApi.id} deployment`;

  try {
    const response = await makeRetryable(apigateway.createDeployment({
      restApiId: restApi.id,
      stageName,
      description
    }))
      .promise();

    winston.debug(`apigateway: createDeployment`, response);

    return response;
  } catch (e) {
    if (e.code !== 'ResourceConflictException') {
      throw e;
    }

    const response = await apigateway.getDeployments({
      restApiId: restApi.id
    })
      .promise();

    winston.debug(`apigateway: getDeployments`, response);

    return response.items.find(
      deployment => deployment.description === description);
  }
};

const ensureStagedIntegration = async ({ restApi, deployment }) => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  try {
    const response = await makeRetryable(apigateway.createStage({
      restApiId: restApi.id,
      stageName,
      deploymentId: deployment.id
    }))
      .promise();

    winston.debug(`apigateway: createStage`, response);

    return response;
  } catch (e) {
    if (e.code !== 'ConflictException') {
      throw e;
    }

    const response = await makeRetryable(apigateway.updateStage({
      restApiId: restApi.id,
      stageName,
      patchOperations: [
        {
          op: 'replace',
          path: '/deploymentId',
          value: deployment.id
        }
      ]
    }))
      .promise();

    winston.debug(`apigateway: updateStage`, response);

    return response;
  }
};

export const restApiToBaseUrl = ({ id }: APIGateway.RestApi) =>
  `https://${id}.execute-api.eu-west-1.amazonaws.com/${stageName}`;

export const ensureLambdaMethod = async ({
  restApi,
  lambdaArn,
  resourceId
}) => {
  const restMethod = await ensureProxyMethod({ restApi, resourceId });
  await ensureIntegration({ restApi, resourceId, restMethod, lambdaArn });
};

export const ensureStagedDeployment = async ({ restApi }) => {
  const deployment = await ensureDeployment({ restApi });
  await ensureStagedIntegration({ restApi, deployment });
};

const pruneRestApi = (restApi: APIGateway.RestApi) => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  return makeRetryable(apigateway.deleteRestApi({ restApiId: restApi.id })).promise();
};

export const pruneApiGateway = async (filter: (_: APIGateway.RestApi) => boolean) => {
  const restApis = await getRestApis();

  winston.debug(`pruneApiGateway: restApis`, restApis);

  const promises = restApis
    .filter(filter)
    .map(pruneRestApi);

  await Promise.all(promises);
};

const pruneDomainName = async (domainName: string) => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  winston.debug(`pruneDomainName: deleteBasePathMapping`, domainName);

  await apigateway.deleteBasePathMapping({
    domainName,
    basePath: '(none)'
  })
    .promise();

  winston.debug(`pruneDomainName: deleteDomainName`, domainName);

  await apigateway.deleteDomainName({ domainName })
    .promise();
};

export const pruneDomainNames = async (filter: (_: string) => boolean) => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  const domainNames = await apigateway.getDomainNames({ limit: assumedLimit })
    .promise();

  winston.debug(`pruneDomainNames: domainNames`, domainNames.items);

  const promises = domainNames.items
    .map(({ domainName }) => domainName)
    .filter(filter)
    .map(pruneDomainName);

  await Promise.all(promises);
};

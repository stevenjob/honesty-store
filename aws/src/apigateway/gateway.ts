import { APIGateway, config } from 'aws-sdk';
import * as winston from 'winston';
import ms = require('ms');

interface NestedRestApi {
  restApi: APIGateway.RestApi;
}
interface NestedResource {
  resource: APIGateway.Resource;
}
type IntegrationParams =
  NestedRestApi &
  NestedResource &
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

export const ensureRestApi = async ({ name }): Promise<APIGateway.RestApi> => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  const restApis = await getRestApis();

  const found = restApis.find(restApi => restApi.name === name);

  if (found) {
    winston.debug(`apigateway: found restApi`, found);

    return found;
  }

  winston.debug(`apigateway: couldn't find '${name}'`);

  const response = await makeRetryable(apigateway.createRestApi({ name })).promise();

  winston.debug(`apigateway: createRestApi`, response);

  return response;
};

const ensureResource = async ({ restApi, path, parentPath }) => {
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

const ensureProxyMethod = async ({ restApi, resource }: NestedRestApi & NestedResource) => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  try {
    const response = await makeRetryable(apigateway.putMethod({
      restApiId: restApi.id,
      resourceId: resource.id,
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
      resourceId: resource.id,
      httpMethod: 'ANY'
    })
      .promise();

    winston.debug(`apigateway: getMethod`, response);

    return response;
  }
};

const ensureIntegration = async ({ restApi, resource, lambdaArn }: IntegrationParams) => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  try {
    const response = await makeRetryable(apigateway.putIntegration({
      restApiId: restApi.id,
      resourceId: resource.id,
      httpMethod: 'ANY',
      integrationHttpMethod: 'POST',
      type: 'AWS_PROXY',
      uri: `arn:aws:apigateway:${config.region}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`,
      contentHandling: 'CONVERT_TO_TEXT',
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
      resourceId: resource.id,
      httpMethod: 'ANY'
    }))
      .promise();

    winston.debug(`apigateway: updateIntegration`, response);

    return response;
  }
};

const ensureDeployment = async ({ restApi, serviceName }) => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });
  const description = `${serviceName} deployment`;

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

export const ensureApiGateway = async ({
  restApi,
  serviceName,
  lambdaArn
}) => {
  await ensureResource({
    restApi,
    path: serviceName,
    parentPath: '/'
  });
  const proxyResource = await ensureResource({
    restApi,
    path: '{proxy+}',
    parentPath: `/${serviceName}`
  });

  const restMethod = await ensureProxyMethod({ restApi, resource: proxyResource });
  await ensureIntegration({ restApi, resource: proxyResource, restMethod, lambdaArn });
  const deployment = await ensureDeployment({ restApi, serviceName });

  await ensureStagedIntegration({ restApi, deployment });
};

const pruneRestApi = (restApi: APIGateway.RestApi) => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  return apigateway.deleteRestApi({ restApiId: restApi.id }).promise();
};

export const pruneApiGateway = async (filter: (_: APIGateway.RestApi) => boolean) => {
  const restApis = await getRestApis();

  winston.debug(`pruneApiGateway: restApis`, restApis);

  const promises = restApis
    .filter(filter)
    .map(pruneRestApi);

  await Promise.all(promises);
};

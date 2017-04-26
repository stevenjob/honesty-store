import { APIGateway, config } from 'aws-sdk';
import * as winston from 'winston';

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
const stageName = 'prod';

const getRestApis = async () =>
  (await new APIGateway({ apiVersion: '2015-07-09' })
  .getRestApis({ limit: assumedLimit })
  .promise())
  .items;

const ensureRestApi = async ({ branch }): Promise<APIGateway.RestApi> => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  const restApis = await getRestApis();

  const restApiName = `lambda-${branch}`;

  const found = restApis.filter(({ name }) => name === restApiName);

  if (found.length) {
    const response = found[0];

    winston.debug(`apigateway: found restApi`, response);

    return response;
  }

  winston.debug(`apigateway: couldn't find '${restApiName}'`);

  const response = await apigateway.createRestApi({ name: restApiName }).promise();

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

  const existingResources = resources.items.filter(resource => resource.pathPart === path);
  if (existingResources.length) {
    const existing = existingResources[0];
    winston.debug(`apigateway: found existing resource`, existing);
    return existing;
  }

  winston.debug(`apigateway: couldn't find '${path}' resource, creating...`, resources.items);

  const parentIds = resources.items
    .filter(resource => resource.path === parentPath);

  if (parentIds.length !== 1) {
    throw new Error(`too many (${parentIds.length}) parentIds for path=${path} parentPath=${parentPath}`);
  }

  const parentId = parentIds[0].id;

  const response = await apigateway.createResource({
    restApiId: restApi.id,
    parentId,
    pathPart: path
  })
    .promise();

  winston.debug(`apigateway: createResource`, response);

  return response;
};

const ensureProxyMethod = async ({ restApi, resource }: NestedRestApi & NestedResource) => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  try {
    const response = await apigateway.putMethod({
      restApiId: restApi.id,
      resourceId: resource.id,
      httpMethod: 'ANY',
      authorizationType: 'NONE'
    })
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
    const response = await apigateway.putIntegration({
      restApiId: restApi.id,
      resourceId: resource.id,
      httpMethod: 'ANY',
      integrationHttpMethod: 'POST',
      type: 'AWS_PROXY',
      uri: `arn:aws:apigateway:${config.region}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`,
      contentHandling: 'CONVERT_TO_TEXT',
      credentials: null
    })
      .promise();

    winston.debug(`apigateway: putIntegration`, response);

    return response;
  } catch (e) {
    if (e.code !== 'ResourceConflictException') {
      throw e;
    }

    const response = await apigateway.updateIntegration({
      restApiId: restApi.id,
      resourceId: resource.id,
      httpMethod: 'ANY'
    })
      .promise();

    winston.debug(`apigateway: updateIntegration`, response);

    return response;
  }
};

const ensureDeployment = async ({ restApi, serviceName }) => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });
  const description = `${serviceName} deployment`;

  try {
    const response = await apigateway.createDeployment({
      restApiId: restApi.id,
      stageName,
      description
    })
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

    return response.items.filter(
      deployment => deployment.description === description)[0];
  }
};

const ensureStagedIntegration = async ({ restApi, deployment }) => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  try {
    const response = await apigateway.createStage({
      restApiId: restApi.id,
      stageName,
      deploymentId: deployment.id
    })
      .promise();

    winston.debug(`apigateway: createStage`, response);

    return response;
  } catch (e) {
    if (e.code !== 'ConflictException') {
      throw e;
    }

    const response = await apigateway.updateStage({
      restApiId: restApi.id,
      stageName,
      patchOperations: [
        {
          op: 'replace',
          path: '/deploymentId',
          value: deployment.id
        }
      ]
    })
      .promise();

    winston.debug(`apigateway: updateStage`, response);

    return response;
  }
};

export const ensureApiGateway = async ({
  branch,
  serviceName,
  lambdaArn
}) => {
  const restApi = await ensureRestApi({ branch });

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
  const integration = await ensureIntegration({ restApi, resource: proxyResource, restMethod, lambdaArn });
  const deployment = await ensureDeployment({ restApi, serviceName });
  const stage = await ensureStagedIntegration({ restApi, deployment });

  // tslint:disable-next-line:no-unused-expression
  void integration;

  return stage;
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

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

const ensureRestApi = async ({ serviceName }: { serviceName: string }): Promise<APIGateway.RestApi> => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  const restApis = await apigateway
    .getRestApis({ limit: assumedLimit })
    .promise();

  const restApiName = `lambda-api-${serviceName}`;

  const found = restApis.items.filter(({ name }) => name === restApiName);

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

const ensureResource = async ({ restApi }: NestedRestApi) => {
  const apigateway = new APIGateway({ apiVersion: '2015-07-09' });

  const proxyPath = '{proxy+}';

  const resources = await apigateway.getResources({
    restApiId: restApi.id,
    limit: assumedLimit
  })
    .promise();

  const existingResources = resources.items.filter(resource => resource.pathPart === proxyPath);
  if (existingResources.length) {
    const existing = existingResources[0];
    winston.debug(`apigateway: found existing resource`, existing);
    return existing;
  }

  winston.debug(`apigateway: couldn't find '${proxyPath}' resource, creating...`, resources.items);

  const rootId = resources.items
    .filter(resource => resource.path === '/')[0].id;

  const response = await apigateway.createResource({
    restApiId: restApi.id,
    parentId: rootId,
    pathPart: proxyPath
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
  serviceName,
  lambdaArn
}) => {
  const restApi = await ensureRestApi({ serviceName });
  const resource = await ensureResource({ restApi });
  const restMethod = await ensureProxyMethod({ restApi, resource });
  const integration = await ensureIntegration({ restApi, resource, restMethod, lambdaArn });
  const deployment = await ensureDeployment({ restApi, serviceName });
  const stage = await ensureStagedIntegration({ restApi, deployment });

  // tslint:disable-next-line:no-unused-expression
  void integration;

  return stage;
};

export const pruneGateway = async (_filter: (_: string) => boolean) => {
  // TODO
};

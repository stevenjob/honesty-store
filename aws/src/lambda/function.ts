import { Lambda } from 'aws-sdk';
import uuid = require('uuid/v4');
import * as winston from 'winston';
import zipdir = require('zip-dir');

const zip = (dir, filter) => new Promise<Buffer>((res, rej) => {
  zipdir(dir, { filter }, (err, buffer) => {
    if (err) {
      return rej(err);
    }
    return res(buffer);
  });
});

const dynamoAccessToRole = ({ access, live }: { access?: 'ro' | 'rw', live: boolean }) => {
  if (!access) {
    return 'arn:aws:iam::812374064424:role/lambda_basic_execution';
  }

  const name = live ? 'honesty-store' : 'hs';

  return `arn:aws:iam::812374064424:role/${name}-lambda-dynamo-${access}`;
};

const ensureLambda = async ({ name, handler, environment, dynamoAccess, zipFile, live }) => {
  const lambda = new Lambda({ apiVersion: '2015-03-31' });

  const role = dynamoAccessToRole({ access: dynamoAccess, live });
  const params = {
    FunctionName: name,
    Timeout: 10,
    Role: role,
    Handler: handler,
    Environment: {
      Variables: environment
    },
    Runtime: 'nodejs6.10',
    TracingConfig: {
      Mode: 'Active'
    }
  };

  try {
    const response = await lambda.createFunction({
      ...params,
      Code: {
        ZipFile: zipFile
      }
    })
      .promise();

    winston.debug(`function: createFunction`, response);

    return response;
  } catch (e) {
    if (e.code !== 'ResourceConflictException') {
      throw e;
    }
    const func = await lambda.updateFunctionCode({
      FunctionName: name,
      ZipFile: zipFile,
      Publish: true
    })
      .promise();

    winston.debug(`function: updateFunctionCode`, func);

    const config = await lambda.updateFunctionConfiguration({
      FunctionName: name,
      ...params
    })
      .promise();

    winston.debug(`function: updateFunctionConfiguration`, config);

    return func;
  }
};

const permitLambdaCallFromApiGateway = async ({ func }) => {
  const lambda = new Lambda({ apiVersion: '2015-03-31' });

  const permission = await lambda.addPermission({
    FunctionName: func.FunctionArn,
    StatementId: uuid(),
    Action: 'lambda:InvokeFunction',
    Principal: 'apigateway.amazonaws.com'
  })
    .promise();

  winston.debug(`function: addPermission`, permission);
};

export const ensureFunction = async ({
  name,
  codeDirectory,
  codeFilter,
  handler,
  environment,
  dynamoAccess,
  withApiGateway = false,
  live
}) => {
  winston.debug(`function: zipping...`);
  const zipFile = await zip(codeDirectory, codeFilter);
  winston.debug(`function: uploading...`);
  const lambda = await ensureLambda({ name, handler, environment, dynamoAccess, zipFile, live });

  if (withApiGateway) {
    await permitLambdaCallFromApiGateway({ func: lambda });
  }

  return lambda;
};

export const pruneFunctions = async (filter = (_func: Lambda.FunctionConfiguration) => false) => {
  const lambda = new Lambda({ apiVersion: '2015-03-31' });

  const listResponse = await lambda.listFunctions()
    .promise();

  winston.debug(`pruneFunctions: functions`, listResponse.Functions);

  const promises = listResponse.Functions
    .filter(filter)
    .map((func) =>
      lambda.deleteFunction({ FunctionName: func.FunctionName })
        .promise()
    );

  await Promise.all(promises);
};

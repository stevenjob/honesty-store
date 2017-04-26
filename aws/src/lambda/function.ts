import { Lambda } from 'aws-sdk';
import crypto = require('crypto');
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

const calculateSha256 = buffer =>
 crypto.createHash('sha256')
    .update(buffer)
    .digest('base64');

const ensureLambda = async ({ name, handler, environment, withDynamo, zipFile }) => {
  const lambda = new Lambda({ apiVersion: '2015-03-31' });

  try {
    const getFuncResponse = await lambda.getFunction({ FunctionName: name }).promise();
    const { Configuration: { CodeSize: size, CodeSha256: sha256 } } = getFuncResponse;
    if (size === zipFile.byteLength && sha256 === calculateSha256(zipFile)) {
      return getFuncResponse.Configuration;
    }
  } catch (e) {
    if (e.code !== 'ResourceNotFoundException') {
      throw e;
    }
  }

  const role = withDynamo
    ? 'arn:aws:iam::812374064424:role/aws-lambda-and-dynamo-ro'
    : 'arn:aws:iam::812374064424:role/lambda_basic_execution';
  const params = {
    FunctionName: name,
    Role: role,
    Handler: handler,
    Environment: {
      Variables: environment
    },
    Runtime: 'nodejs6.10'
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

const permitLambdaOnApiGateway = async ({ func }) => {
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
  withDynamo = false,
  withApiGateway = false
}) => {
  const zipFile = await zip(codeDirectory, codeFilter);
  const lambda = await ensureLambda({ name, handler, environment, withDynamo, zipFile });

  if (withApiGateway) {
    await permitLambdaOnApiGateway({ func: lambda });
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

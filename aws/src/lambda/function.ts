import { Lambda } from 'aws-sdk';
import crypto = require('crypto');
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

export const ensureFunction = async ({
  name,
  codeDirectory,
  codeFilter,
  handler,
  environment,
  requireDynamo = false
}) => {
  const zipFile = await zip(codeDirectory, codeFilter);
  const lambda = new Lambda({ apiVersion: '2015-03-31' });

  const getFuncResponse = await lambda.getFunction({ FunctionName: name }).promise();
  const { Configuration: { CodeSize: size, CodeSha256: sha256 } } = getFuncResponse;
  if (size === zipFile.byteLength && sha256 === calculateSha256(zipFile)) {
    return getFuncResponse.Configuration;
  }

  const role = requireDynamo
    ? 'arn:aws:iam::812374064424:role/aws-lambda-and-dynamo-streams'
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

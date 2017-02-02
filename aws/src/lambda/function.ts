import { Lambda } from 'aws-sdk';
import * as winston from 'winston';
import JSZip = require('jszip');

const zip = async (filename, content) => {
    const zip = new JSZip();
    zip.file('index.js', content);
    return await zip.generateAsync({
        type: 'nodebuffer'
    });
};

export const ensureFunction = async ({ name, code }) => {
    const zipFile = await zip('index.js', code);

    const lambda = new Lambda({ apiVersion: '2015-03-31' });
    try {
        const response = await lambda.createFunction({
            Code: {
                ZipFile: zipFile
            },
            FunctionName: name,
            Role: 'arn:aws:iam::812374064424:role/lambda_basic_execution',
            Handler: 'index.handler',
            Runtime: 'nodejs4.3'
        })
            .promise();

        winston.debug(`function: createFunction`, response);

        return response;
    }
    catch (e) {
        if (e.code !== 'ResourceConflictException') {
            throw e;
        }
        const response = await lambda.updateFunctionCode({
                FunctionName: name,
                ZipFile: zipFile,
                Publish: true
            })
            .promise();

        winston.debug(`function: updateFunctionCode`, response);

        return response;
    }
};

export const pruneFunctions = async (filter = (func: Lambda.FunctionConfiguration) => false) => {
    const lambda = new Lambda({ apiVersion: '2015-03-31' });

    const listResponse = await lambda.listFunctions()
        .promise();

    winston.debug(`pruneFunctions: functions`, listResponse.Functions);

    const promises = listResponse.Functions
        .filter(filter)
        .map((func) => lambda.deleteFunction({ FunctionName: func.FunctionName }));

    await Promise.all(promises);
};

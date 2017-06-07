import pathToRegexp = require('path-to-regexp');

import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

import { CodedError } from './error';
import { Key } from './key';
import { error, info } from './log';
import { verifyServiceSecret } from './serviceSecret';
import time from './time';

AWSXRay.captureAWS(AWS);

interface Params {
  [key: string]: string;
}

interface LambdaBodyAction<Body, Result> {
  (key: Key, params: Params, body: Body): Promise<Result>;
}

export interface LambdaRouter {
  (event: any, context: any): void;
  get<Result>(path: string, action: LambdaBodyAction<undefined, Result>);
  post<Body, Result>(path: string, action: LambdaBodyAction<Body, Result>);
  put<Body, Result>(path: string, action: LambdaBodyAction<Body, Result>);
}

export const lambdaRouter = (service: string, version: number): LambdaRouter => {

  const endpoints = [];

  const handler: any = ({ serviceSecret, key, method, path, body }: any, { succeed }: any) => {
    const timer = time();

    const handleError = (e: CodedError) => {
      const duration = timer();
      error(key, `failed ${method} ${path}`, { e, duration });
      succeed({
        error: {
          message: e.message,
          code: e.code || 'UnknownError'
        }
      });
    };

    info(key, `handling ${method} ${path}`, { body });
    try {
      verifyServiceSecret(serviceSecret);
      for (const endpoint of endpoints) {
        const params = endpoint.parse(method, path);
        if (params != null) {
          endpoint.invoke(key, params, body)
            .then(result => {
              const duration = timer();
              info(key, `successful ${method} ${path}`, { result, duration });
              succeed({
                response: result
              });
            })
            .catch(handleError);
          return;
        }
      }
      throw new Error('Unhandled request');
    } catch (e) {
      handleError(e);
    }
  };

  const createEndpoint = <Body, Result>(method: 'get' | 'post' | 'put', path: string, action: LambdaBodyAction<Body, Result>) => {
    const pathKeys = [];
    const pathRegex = pathToRegexp(`/${service}/v${version}${path}`, pathKeys);
    endpoints.push({
      parse: (requestMethod, requestPath) => {
        if (requestMethod.toLowerCase() !== method.toLowerCase()) {
          return;
        }
        const matches = pathRegex.exec(requestPath);
        if (matches == null) {
          return;
        }
        const params = {};
        for (let i = 1; i < matches.length; i++) {
          params[pathKeys[i - 1].name] = matches[i];
        }
        return params;
      },
      invoke: action
    });
  };

  handler.get = <Result>(path: string, action: LambdaBodyAction<undefined, Result>) =>
    createEndpoint('get', path, action);

  handler.post = <Body, Result>(path: string, action: LambdaBodyAction<Body, Result>) =>
    createEndpoint('post', path, action);

  handler.put = <Body, Result>(path: string, action: LambdaBodyAction<Body, Result>) =>
    createEndpoint('put', path, action);

  return handler;
};

import HTTPStatus = require('http-status');
import express = require('express');
import pathToRegexp = require('path-to-regexp');

import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

import { CodedError } from './error';
import { createServiceKey, Key } from './key';
import { error, info } from './log';
import { verifyServiceSecret } from './serviceSecret';
import time from './time';

AWSXRay.captureAWS(AWS);

interface Params {
  [key: string]: string;
}

interface ExpressBodyAction<Result, Body> {
  (key: Key, params: Params, body: Body, request: any): Promise<Result>;
}

interface ExpressAuthentication {
  (request: any, response: any, next: any): void;
}

interface ExpressRouter {
  (request: any, response: any, next: any): void;
  get<Result>(path: string, authentication: ExpressAuthentication, action: ExpressBodyAction<undefined, Result>);
  post<Body, Result>(path: string, authentication: ExpressAuthentication, action: ExpressBodyAction<Body, Result>);
  put<Body, Result>(path: string, authentication: ExpressAuthentication, action: ExpressBodyAction<Body, Result>);
}

interface LambdaBodyAction<Result, Body> {
  (key: Key, params: Params, body: Body): Promise<Result>;
}

interface LambdaRouter {
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
          params[matches.keys[i - 1].name] = matches[i];
        }
        return params;
      },
      invoke: action
    });
  };

  handler.get = <Result>(path: string, action: LambdaBodyAction<undefined, Result>) =>
    createEndpoint('get', path, action);

  handler.post = <Body, Result>(path: string, action: LambdaBodyAction<Body, Result>) =>
    createEndpoint('get', path, action);

  handler.put = <Body, Result>(path: string, action: LambdaBodyAction<Body, Result>) =>
    createEndpoint('get', path, action);

  return handler;
};

const extractKey = (request, service: string): Key => {
  try {
    return JSON.parse(request.get('key'));
  } catch (e) {
    return createServiceKey({ service });
  }
};

const extractServiceSecret = (request) => request.get('service-secret');

export const serviceAuthentication = (request, response, next) => {
  const serviceSecret = extractServiceSecret(request);

  try {
    verifyServiceSecret(serviceSecret);
  } catch (e) {
    error(
      request.key,
      `failed ${request.method} ${request.url} - service secret mismatch`,
      e);

    response.status(HTTPStatus.UNAUTHORIZED)
      .json({ error: { message: e.message } });

    return;
  }

  next();
};

const createEndPoint = (service, internalRouter, version, method: 'get' | 'post' | 'put') =>
  <Body, Result>(path, authentication: ExpressAuthentication, action: ExpressBodyAction<Body, Result>) => {
    internalRouter[method](
      `/${service}/v${version}${path}`,
      authentication,
      (request, response) => {
        const timer = time();
        const key = request.key || extractKey(request, service);
        // tslint:disable-next-line:max-line-length
        const { params, body } = request;
        info(key, `handling ${method} ${request.url}`, { params, body });
        action(key, request.params, /* maybe undefined */request.body, request)
          .then(result => {
            const duration = timer();
            info(key, `successful ${method} ${request.url}`, { result, duration });
            response.status(HTTPStatus.OK)
              .json({ response: result });
          })
          .catch((e) => {
            const duration = timer();
            error(key, `failed ${method} ${request.url}`, { e, duration });

            const code: CodedError = e.code || 'UnknownError';
            response.status(200)
              .json({
                error: {
                  message: e.message,
                  code
                }
              });
          });
      });
  };

export const expressRouter = (service: string, version: number): ExpressRouter => {
  const internalRouter = express.Router();

  const router: any = (request, response, next) =>
    internalRouter(request, response, next);

  router.get = createEndPoint(service, internalRouter, version, 'get');
  router.post = createEndPoint(service, internalRouter, version, 'post');
  router.put = createEndPoint(service, internalRouter, version, 'put');

  return router;
};

import HTTPStatus = require('http-status');
import express = require('express');

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

interface BodyAction<Result, Body> {
  (key: Key, params: Params, body: Body, request: any): Promise<Result>;
}

interface ExpressAuthentication {
  (request: any, response: any, next: any): void;
}

interface Router {
  (request: any, response: any, next: any): void;
  get<Result>(path: string, authentication: ExpressAuthentication, action: BodyAction<undefined, Result>);
  post<Body, Result>(path: string, authentication: ExpressAuthentication, action: BodyAction<Body, Result>);
  put<Body, Result>(path: string, authentication: ExpressAuthentication, action: BodyAction<Body, Result>);
}

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
  <Body, Result>(path, authentication: ExpressAuthentication, action: BodyAction<Body, Result>) => {
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

export const serviceRouter = (service: string, version: number): Router => {
  const internalRouter = express.Router();

  const router: any = (request, response, next) =>
  internalRouter(request, response, next);

  router.get = createEndPoint(service, internalRouter, version, 'get');
  router.post = createEndPoint(service, internalRouter, version, 'post');
  router.put = createEndPoint(service, internalRouter, version, 'put');

  return router;
};

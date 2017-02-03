import HTTPStatus = require('http-status');
import express = require('express');

import { createServiceKey, Key } from './key';
import { error, info } from './log';
import { verifyServiceSecret } from './serviceSecret';
import time from './time';

interface Params {
  [key: string]: string;
}

interface BodyAction<Result, Body> {
  (key: Key, params: Params, body: Body, request: any): Promise<Result>;
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

interface ExpressAuthentication {
  (request: any, response: any, next: any): void;
}

const createEndPoint = (service, internalRouter, version, method: 'get' | 'post' | 'put') =>
  <Body, Result>(path, authentication: ExpressAuthentication, action: BodyAction<Body, Result>) => {
    internalRouter[method](
      `/${service}/v${version}${path}`,
      authentication,
      (request, response) => {
        const timer = time();
        const key = extractKey(request, service);
        // tslint:disable-next-line:max-line-length
        info(key, `handling ${method} ${request.url} request = { params: '${JSON.stringify(request.params)}', body: '${JSON.stringify(request.body)}' }`);
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
            response.status(e.statusCode || 200)
            .json({ error: { message: e.message }});
          });
      });
  };

export class ServiceRouterCode extends Error {
  public statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const serviceRouter = (service: string, version: number): Router => {
  const internalRouter = express.Router();

  const router: any = (request, response, next) =>
  internalRouter(request, response, next);

  router.get = createEndPoint(service, internalRouter, version, 'get');
  router.post = createEndPoint(service, internalRouter, version, 'post');
  router.put = createEndPoint(service, internalRouter, version, 'put');

  return router;
};

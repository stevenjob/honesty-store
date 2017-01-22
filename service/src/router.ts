import * as winston from 'winston';
import HTTPStatus = require('http-status');
import express = require('express');

interface Key {

}

interface Params {
    [key: string]: string;
}

interface Action<Result> {
    (key: Key, params: Params): Promise<Result>;
}

interface BodyAction<Result, Body> {
    (key: Key, params: Params, body: Body): Promise<Result>;
}

interface Router {
    (request, response, next): void;
    get<Result>(path: string, version: number, action: Action<Result>);
    post<Body, Result>(path: string, version: number, action: BodyAction<Body, Result>);
    put<Body, Result>(path: string, version: number, action: BodyAction<Body, Result>);
}

const extractKey = (request): Key => request.get('key');

export default (service: string): Router => {
    const internalRouter = express.Router();

    const router: any = (request, response, next) =>
        internalRouter(request, response, next);

    router.get = <Result>(path, version: number, action: Action<Result>) => {
        internalRouter.get(`/${service}/v${version}${path}`, (request, response) => {
            winston.info(`GET ${request.url} request`);
            action(extractKey(request), request.params)
                .then(result => {
                    winston.info(`GET ${request.url} success`, result);
                    response.status(HTTPStatus.OK)
                        .json({ response: result });
                })
                .catch((error) => {
                    winston.error(`GET ${request.url} failure`, error);
                    response.status(200)
                        .json({ error: { message: error.message }});
                });
        });
    };

    router.post = <Body, Result>(path, version: number, action: BodyAction<Body, Result>) => {
        internalRouter.post(`/${service}/v${version}${path}`, (request, response) => {
            winston.info(`POST ${request.url} request`, request.body);
            action(extractKey(request), request.params, request.body)
                .then(result => {
                    winston.info(`POST ${request.url} success`, result);
                    response.status(HTTPStatus.OK)
                        .json({ response: result });
                })
                .catch((error) => {
                    winston.error(`POST ${request.url} failure`, error);
                    response.status(200)
                        .json({ error: { message: error.message }});
                });
        });
    };

    router.put = <Body, Result>(path, version: number, action: BodyAction<Body, Result>) => {
        internalRouter.put(`/${service}/v${version}${path}`, (request, response) => {
            winston.info(`PUT ${request.url} request`, request.body);
            action(extractKey(request), request.params, request.body)
                .then(result => {
                    winston.info(`PUT ${request.url} success`, result);
                    response.status(HTTPStatus.OK)
                        .json({ response: result });
                })
                .catch((error) => {
                    winston.error(`PUT ${request.url} failure`, error);
                    response.status(200)
                        .json({ error: { message: error.message }});
                });
        });
    };

    return router;
};
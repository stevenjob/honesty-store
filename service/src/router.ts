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
    get<Result>(path: string, action: Action<Result>);
    post<Body, Result>(path: string, action: BodyAction<Body, Result>);
    put<Body, Result>(path: string, action: BodyAction<Body, Result>);
}

const extractKey = (request: Express.Request): Key => {
    // TODO: something useful
    return Math.random();
}

export default (): Router => {
    const internalRouter = express.Router();

    const router: any = (request, response, next) =>
        internalRouter(request, response, next);

    router.get = <Result>(path, action: Action<Result>) => {
        internalRouter.get(path, (request, response) => {
            winston.debug(`GET ${request.url} request`);
            action(extractKey(request), request.params)
                .then(result => {
                    winston.info(`GET ${request.url} success`);
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

    router.post = <Body, Result>(path, action: BodyAction<Body, Result>) => {
        internalRouter.post(path, (request, response) => {
            winston.debug(`POST ${request.url} request`);
            action(extractKey(request), request.params, request.body)
                .then(result => {
                    winston.info(`POST ${request.url} success`);
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

    router.put = <Body, Result>(path, action: BodyAction<Body, Result>) => {
        internalRouter.put(path, (request, response) => {
            winston.debug(`PUT ${request.url} request`);
            action(extractKey(request), request.params, request.body)
                .then(result => {
                    winston.info(`PUT ${request.url} success`);
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
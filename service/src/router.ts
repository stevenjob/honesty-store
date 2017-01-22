import { info, error } from './log';
import HTTPStatus = require('http-status');
import express = require('express');
import { Key } from './key';

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
            const key = extractKey(request);
            info(key, `GET ${request.url} request`);
            action(key, request.params)
                .then(result => {
                    info(key, `GET ${request.url} success`, result);
                    response.status(HTTPStatus.OK)
                        .json({ response: result });
                })
                .catch((e) => {
                    error(key, `GET ${request.url} failure`, e);
                    response.status(200)
                        .json({ error: { message: e.message }});
                });
        });
    };

    router.post = <Body, Result>(path, version: number, action: BodyAction<Body, Result>) => {
        internalRouter.post(`/${service}/v${version}${path}`, (request, response) => {
            const key = extractKey(request);
            info(key, `POST ${request.url} request`, request.body);
            action(key, request.params, request.body)
                .then(result => {
                    info(key, `POST ${request.url} success`, result);
                    response.status(HTTPStatus.OK)
                        .json({ response: result });
                })
                .catch((e) => {
                    error(key, `POST ${request.url} failure`, e);
                    response.status(200)
                        .json({ error: { message: e.message }});
                });
        });
    };

    router.put = <Body, Result>(path, version: number, action: BodyAction<Body, Result>) => {
        internalRouter.put(`/${service}/v${version}${path}`, (request, response) => {
            const key = extractKey(request);
            info(key, `PUT ${request.url} request`, request.body);
            action(key, request.params, request.body)
                .then(result => {
                    info(key, `PUT ${request.url} success`, result);
                    response.status(HTTPStatus.OK)
                        .json({ response: result });
                })
                .catch((e) => {
                    error(key, `PUT ${request.url} failure`, e);
                    response.status(200)
                        .json({ error: { message: e.message }});
                });
        });
    };

    return router;
};
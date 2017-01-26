import { info, error } from './log';
import HTTPStatus = require('http-status');
import express = require('express');
import { Key } from './key';
import { baseUrl } from './baseUrl';
import { verifyServiceSecret } from './serviceSecret';

interface Params {
    [key: string]: string;
}

interface BodyAction<Result, Body> {
    (key: Key, params: Params, body: Body): Promise<Result>;
}

interface Router {
    (request, response, next): void;
    get<Result>(path: string, version: number, action: BodyAction<undefined, Result>);
    post<Body, Result>(path: string, version: number, action: BodyAction<Body, Result>);
    put<Body, Result>(path: string, version: number, action: BodyAction<Body, Result>);
}

const extractKey = (request): Key => JSON.parse(request.get('key'));

const extractServiceSecret = (request) => request.get('service-secret');

const serviceAuthentication = (request, response, next) => {
    const serviceSecret = extractServiceSecret(request);

    try {
        verifyServiceSecret(serviceSecret);
    } catch (e) {
        response.status(HTTPStatus.UNAUTHORIZED)
            .json({ error: { message: e.message }});

        return;
    }

    next();
};

const createEndPoint = (service, internalRouter, method: 'get' | 'post' | 'put') => <Body, Result>(path, version: number, action: BodyAction<Body, Result>) => {
    internalRouter[method](
        `/${service}/v${version}${path}`,
        serviceAuthentication,
        (request, response) => {
            const key = extractKey(request);
            info(key, `handling ${method} ${request.url}`);
            action(key, request.params, /* maybe undefined */request.body)
                .then(result => {
                    info(key, `successful ${method} ${request.url}`, result);
                    response.status(HTTPStatus.OK)
                        .json({ response: result });
                })
                .catch((e) => {
                    error(key, `failed ${method} ${request.url}`, e);
                    response.status(200)
                        .json({ error: { message: e.message }});
                });
        });
};

export default (service: string): Router => {
    const internalRouter = express.Router();

    const router: any = (request, response, next) =>
        internalRouter(request, response, next);

    router.get = createEndPoint(service, internalRouter, 'get');
    router.post = createEndPoint(service, internalRouter, 'post');
    router.put = createEndPoint(service, internalRouter, 'put');

    return router;
};

import { error, info } from './log';
import HTTPStatus = require('http-status');
import express = require('express');
import { Key } from './key';
import { verifyServiceSecret } from './serviceSecret';

interface Params {
    [key: string]: string;
}

interface BodyAction<Result, Body> {
    (key: Key, params: Params, body: Body): Promise<Result>;
}

interface Router {
    (request: any, response: any, next: any): void;
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
        error(
            request.key,
            `failed ${request.method} ${request.url} - service secret mismatch`,
            e);

        response.status(HTTPStatus.UNAUTHORIZED)
            .json({ error: { message: e.message }});

        return;
    }

    next();
};

const time = () => {
    const hrtime = process.hrtime();
    return () => {
        const diff = process.hrtime(hrtime);
        return diff[0] * 1e9 + diff[1];
    };
};

const createEndPoint = (service, internalRouter, method: 'get' | 'post' | 'put') =>
    <Body, Result>(path, version: number, action: BodyAction<Body, Result>) => {
        internalRouter[method](
            `/${service}/v${version}${path}`,
            serviceAuthentication,
            (request, response) => {
                const timer = time();
                const key = extractKey(request);
                info(key, `handling ${method} ${request.url}`);
                action(key, request.params, /* maybe undefined */request.body)
                    .then(result => {
                        const duration = timer();
                        info(key, `successful ${method} ${request.url}`, { result, duration });
                        response.status(HTTPStatus.OK)
                            .json({ response: result });
                    })
                    .catch((e) => {
                        const duration = timer();
                        error(key, `failed ${method} ${request.url}`, { e, duration });
                        response.status(200)
                            .json({ error: { message: e.message }});
                    });
            });
};

// tslint:disable-next-line export-name
export default (service: string): Router => {
    const internalRouter = express.Router();

    const router: any = (request, response, next) =>
        internalRouter(request, response, next);

    router.get = createEndPoint(service, internalRouter, 'get');
    router.post = createEndPoint(service, internalRouter, 'post');
    router.put = createEndPoint(service, internalRouter, 'put');

    return router;
};

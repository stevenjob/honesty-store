import HTTPStatus = require('http-status');
import * as winston from 'winston';
import { Key } from './key';

// generic to allow callers to assert the type of what's being sent back
export const promiseResponse = <T>(promise: Promise<T>, key: Key, response, httpErrorCode = HTTPStatus.OK) => {
    const backtrace = new Error().stack;

    promise
        .then((result: T) => {
            response.status(HTTPStatus.OK)
                .json({ response: result });
        })
        .catch((error) => {
            winston.error(
                `promiseResponse() failed, returning HTTP ${httpErrorCode}`,
                error,
                'instantiation backtrace:',
                backtrace);

            response.status(httpErrorCode)
                .json({ error: { message: error.message }});
        });
};

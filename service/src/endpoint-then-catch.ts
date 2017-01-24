import HTTPStatus = require('http-status');
import { Key } from './key';
import { error } from './log';

// generic to allow callers to assert the type of what's being sent back
export const promiseResponse = <T>(promise: Promise<T>, key: Key, response, httpErrorCode = HTTPStatus.OK) => {
    const backtrace = new Error().stack;

    promise
        .then((result: T) => {
            response.status(HTTPStatus.OK)
                .json({ response: result });
        })
        .catch((e) => {
            error(
                key,
                `promiseResponse() failed, returning HTTP ${httpErrorCode}`,
                e,
                'instantiation backtrace:',
                backtrace);

            response.status(httpErrorCode)
                .json({ error: { message: e.message }});
        });
};

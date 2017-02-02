import HTTPStatus = require('http-status');
import express = require('express');
import { Key } from './key';
import { error } from './log';

// generic to allow callers to assert the type of what's being sent back
export const promiseResponse = <T>(
  promise: Promise<T>,
  request: express.Request & { key: Key },
  response: express.Response,
  httpErrorCode = HTTPStatus.OK
) => {
  const backtrace = new Error().stack;

  promise
    .then((result: T) => {
      response.status(HTTPStatus.OK)
        .json({ response: result });
    })
    .catch((e) => {
      error(
        request.key,
        `${request.method} ${request.url} handled raised an error, returning HTTP ${httpErrorCode}`,
        e,
        backtrace);

      response.status(httpErrorCode)
        .json({ error: { message: e.message } });
    });
};

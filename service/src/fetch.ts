import ms = require('ms');
import { Lambda } from 'aws-sdk';
import { parse as parseUrl } from 'url';
import asyncCache from './asyncCache';
import { baseUrl as defaultBaseUrl } from './baseUrl';
import { CodedError, ErrorCode } from './error';
import { createServiceKey, Key } from './key';
import { error, info } from './log';
import { signServiceSecret } from './serviceSecret';

interface ApiResponseSuccess<T> {
  response: T;
}

interface ApiResponseError {
  error: {
    message: string;
    code: ErrorCode;
  };
}

type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

const isApiResponseError = <T>(response: ApiResponse<T>): response is ApiResponseError =>
  'error' in response;

const getFunctionPrefix = (baseUrl) => {
  const { hostname } = parseUrl(baseUrl);
  if (hostname == null) {
    throw new Error(`Failed to parse ${baseUrl}`);
  }
  const branch = hostname.split('.')[0];
  return branch === 'live' ? 'honesty-store-' : `hs-${branch}-` ;
};

// tslint:disable-next-line:export-name
export default (service: string, baseUrl = defaultBaseUrl) => {
  const getUrl = (version: number, path: string) => `/${service}/v${version}${path}`;

  const fetchAndParse = async <Result>({ method, url, key, body }): Promise<Result> => {
    info(key, `send ${method} ${url}`);

    const request = {
      serviceSecret: signServiceSecret(),
      key,
      method,
      path: url,
      body
    };

    const response = await new Lambda({ apiVersion: '2015-03-31' })
      .invoke({
        InvocationType: 'RequestResponse',
        FunctionName: getFunctionPrefix(baseUrl) + service,
        Payload: JSON.stringify(request)
      }).promise();

    let json: ApiResponse<Result>;
    try {
      json = JSON.parse(<string>response.Payload);
    } catch (e) {
      error(
        key,
        `failed ${method} ${url}, couldn't parse json`,
        {
          httpStatus: response.StatusCode,
          responseText: response.Payload
        });

      throw new Error(`${method} ${url} failed (couldn't parse json), HTTP ${response.StatusCode}`);
    }

    if (response.StatusCode == null || response.StatusCode < 200 || response.StatusCode >= 300) {
      error(key, `failed non-2xx ${method} ${url} ${response.StatusCode}`);
      throw new Error(`${method} ${url} failed (non-2xx response), HTTP ${response.StatusCode}`);
    }

    if (isApiResponseError(json)) {
      error(key, `error ${method} ${url} ${json.error.message}`);

      if (json.error.code) {
        throw new CodedError(json.error.code, json.error.message);
      }
      throw new Error(json.error.message);
    }

    info(key, `success ${method} ${url}`, { status: response.StatusCode, response: json });
    return json.response;
  };

  const cache = asyncCache<string, any>({
    max: 1000,
    maxAge: ms('5s'),
    load: (url) =>
      fetchAndParse({
        method: 'GET',
        url,
        key: createServiceKey({ service })
      })
  });

  // tslint:disable-next-line:no-reserved-keywords
  const get = async <Result>(version: number, key: Key, path: string) => {
    const url = getUrl(version, path);
    info(key, `cache check for GET ${url}`);
    return <Result>(await cache.get(url));
  };

  const post = async <Result>(version: number, key: Key, path: string, body: any): Promise<Result> => {
    return await fetchAndParse<Result>({
      method: 'POST',
      url: getUrl(version, path),
      key,
      body
    });
  };

  const put = async <Result>(version: number, key: Key, path: string, body: any): Promise<Result> => {
    return await fetchAndParse<Result>({
      method: 'PUT',
      url: getUrl(version, path),
      key,
      body
    });
  };

  return {
    get,
    post,
    put
  };
};

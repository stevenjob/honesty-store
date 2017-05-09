import ms = require('ms');
import fetch from 'node-fetch';
import asyncCache from './asyncCache';
import { baseUrl as defaultBaseUrl } from './baseUrl';
import { CodedError, ErrorCode } from './error';
import { createServiceKey, Key } from './key';
import { error, info } from './log';
import { signServiceSecret } from './serviceSecret';

interface ApiResponse<T> {
  response?: T;
  error?: {
    message: string;
    code: ErrorCode;
  };
}

// tslint:disable-next-line:export-name
export default (service: string, baseUrl = defaultBaseUrl) => {
  const getUrl = (version: number, path: string) => `${baseUrl}/${service}/v${version}${path}`;

  const fetchAndParse = async <Result>({ method, url, key, body = undefined }): Promise<Result> => {
    info(key, `send ${method} ${url}`);

    const fetchOptions = {
      method,
      headers: {
        'content-type': body ? 'application/json' : undefined,
        'service-secret': signServiceSecret(),
        key: JSON.stringify(key)
      },
      body: body ? JSON.stringify(body) : undefined
    };

    const response = await fetch(url, fetchOptions);

    let json: ApiResponse<Result>;
    try {
      json = await response.json();
    } catch (jsonParseError) {

      // attempt to get body text to help debugging
      let responseText: string;
      try {
        responseText = await response.text();
      } catch (textResponseError) {
        responseText = '';
      }

      error(
        key,
        `failed ${method} ${url}, couldn't parse json`,
        {
          httpStatus: response.status,
          responseText
        });

      throw new Error(`${method} ${url} failed (couldn't parse json), HTTP ${response.status}`);
    }

    if (!response.ok) {
      error(key, `failed non-2xx ${method} ${url} ${response.status}`);
      throw new Error(`${method} ${url} failed (non-2xx response), HTTP ${response.status}`);
    }

    if (json.error) {
      error(key, `error ${method} ${url} ${json.error.message}`);

      if (json.error.code) {
        throw new CodedError(json.error.code, json.error.message);
      }
      throw new Error(json.error.message);
    }

    info(key, `success ${method} ${url}`, { status: response.status, response: json });
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

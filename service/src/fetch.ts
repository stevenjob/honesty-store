import fetch from 'node-fetch';
import { baseUrl } from './baseUrl';
import { Key } from './key';
import { info, error } from './log';

interface ApiResponse<T> {
    response?: T;
    error?: { message: string };
}

export default (service: string) => {
    const fetchAndParse = async <Result>({ method, version, path, key, headers = {}, body = undefined }): Promise<Result> => {
        const url = `${baseUrl}/${service}/v${version}${path}`;

        info(key, `send ${method} ${url}`);

        const response = await fetch(url, {
            method,
            headers: {
                key: JSON.stringify(key),
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        let json: ApiResponse<Result>;
        try {
            json = await response.json();
        } catch (e) {
            throw new Error(`${method} ${path} failed (couldn't parse json), HTTP ${response.status}`);
        }

        if (json.error) {
            throw new Error(json.error.message);
        }

        return json.response;
    };

    const get = async <Result>(version: number, key: Key, path: String) => {
        return await fetchAndParse<Result>({
            method: 'GET',
            version,
            path,
            key,
        });
    };

    const post = async <Result>(version: number, key: Key, path: String, body: any): Promise<Result> => {
        return await fetchAndParse<Result>({
            method: 'POST',
            version,
            path,
            headers: {
                'content-type': 'application/json',
            },
            key,
            body,
        });
    };

    const put = async <Result>(version: number, key: Key, path: String, body: any): Promise<Result> => {
        return await fetchAndParse<Result>({
            method: 'PUT',
            version,
            path,
            headers: {
                'content-type': 'application/json',
            },
            key,
            body,
        });
    };

    return {
        get,
        post,
        put
    };
};

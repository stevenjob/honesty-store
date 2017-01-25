import fetch from 'node-fetch';
import { baseUrl } from './baseUrl';
import { Key } from './key';
import { info } from './log';

interface ApiResponse<T> {
    response?: T;
    error?: { message: string };
}

export default (service: string) => {

    const get = async <Result>(version: number, key: Key, path: String) => {
        const url = `${baseUrl}/${service}/v${version}${path}`;
        info(key, `send GET ${url}`);
        const response = await fetch(url, {
            headers: {
                key: JSON.stringify(key),
            }
        })
            .then<ApiResponse<Result>>(response => response.json());
        if (response.error) {
            throw new Error(response.error.message);
        }
        return response.response;
    };

    const post = async <Result>(version: number, key: Key, path: String, body: any): Promise<Result> => {
        const url = `${baseUrl}/${service}/v${version}${path}`;
        info(key, `send POST ${url}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                key: JSON.stringify(key),
            },
            body: JSON.stringify(body)
        })
            .then<ApiResponse<Result>>(response => response.json());
        if (response.error) {
            throw new Error(response.error.message);
        }
        return response.response;
    };

    const put = async <Result>(version: number, key: Key, path: String, body: any): Promise<Result> => {
        const url = `${baseUrl}/${service}/v${version}${path}`;
        info(key, `send PUT ${url}`);
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                key: JSON.stringify(key),
            },
            body: JSON.stringify(body)
        })
            .then<ApiResponse<Result>>(response => response.json());
        if (response.error) {
            throw new Error(response.error.message);
        }
        return response.response;
    };

    return {
        get,
        post,
        put
    };
};

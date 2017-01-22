import * as winston from 'winston';
import fetch from 'node-fetch';
import { baseUrl } from './baseUrl';
import { ApiResponse } from './types';
import { Key } from './key';

export default (service: string) => {

    const get = async <Result>(version: number, key: Key, path: String) => {
        const response = await fetch(`${baseUrl}/${service}/v${version}${path}`, {
            headers: {
                key
            }
        })
            .then<ApiResponse<Result>>(response => response.json());
        if (response.error) {
            throw new Error(response.error.message);
        }
        return response.response;
    };

    const post = async <Result>(version: number, key: Key, path: String, body: any): Promise<Result> => {
        const response = await fetch(`${baseUrl}/${service}/v${version}${path}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                key
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
        const response = await fetch(`${baseUrl}/${service}/v${version}${path}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                key
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
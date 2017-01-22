import * as winston from 'winston';
import fetch from 'node-fetch';
import { baseUrl } from './baseUrl';
import { ApiResponse } from './types';
import { Key } from './key';

export const get = async <Result>(key: Key, path: String) => {
    const response = await fetch(`${baseUrl}${path}`)
        .then<ApiResponse<Result>>(response => response.json());
    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.response;
};

export const post = async <Result>(key: Key, path: String, body: any): Promise<Result> => {
    const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'key': key
        },
        body: JSON.stringify(body)
    })
        .then<ApiResponse<Result>>(response => response.json());
    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.response;
};

export const put = async <Result>(key: Key, path: String, body: any): Promise<Result> => {
    const response = await fetch(`${baseUrl}${path}`, {
        method: 'PUT',
        headers: {
            'content-type': 'application/json',
            'key': key
        },
        body: JSON.stringify(body)
    })
        .then<ApiResponse<Result>>(response => response.json());
    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.response;
};

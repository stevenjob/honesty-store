import fetch from 'node-fetch';

export interface ApiResponse<T> {
    response?: T;
    error?: { message: string };
}

export interface User {
    id: string;
    accountId: string;
    defaultStoreId: string;
    emailAddress: string;
}

interface WithRefreshToken {
    refreshToken: string;
}

interface WithAccessToken {
    accessToken: string;
}

interface WithMagicLinkToken {
    magicLinkToken: string;
}

export interface UserProfile {
    // these fields are an optional subset of User
    defaultStoreId?: string;
    emailAddress?: string;
}

export type UserWithAccessToken = User & WithAccessToken;

export type UserWithAccessAndRefreshTokens = User & WithAccessToken & WithRefreshToken;

export type UserWithMagicLinkToken = User & WithMagicLinkToken;

const baseUrl = process.env.BASE_URL;

export const getUser = async (userId: string): Promise<User> => {
    const response = await fetch(`${baseUrl}/user/v1/${userId}`)
        .then<ApiResponse<User>>(response => response.json());
    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.response;
};

export const getUserByAccessToken = async (accessToken: string): Promise<User> => {
    const response = await fetch(`${baseUrl}/user/v1/accessToken/${accessToken}`)
        .then<ApiResponse<User>>(response => response.json());
    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.response;
};

export const getUserByRefreshToken = async (refreshToken: string): Promise<UserWithAccessToken> => {
    const response = await fetch(`${baseUrl}/user/v1/refreshToken/${refreshToken}`)
        .then<ApiResponse<UserWithAccessToken>>(response => response.json());
    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.response;
};

export const getUserByMagicLinkToken = async (magicLinkToken: string): Promise<UserWithAccessAndRefreshTokens> => {
    const response = await fetch(`${baseUrl}/user/v1/magicLinkToken/${magicLinkToken}`, {
        method: 'GET'
    })
        .then<ApiResponse<UserWithAccessAndRefreshTokens>>(response => response.json());
    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.response;
};

export const createUser = async (userId: string, userProfile: UserProfile): Promise<UserWithAccessAndRefreshTokens> => {
    const response = await fetch(`${baseUrl}/user/v1/`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ userId, ...userProfile })
    })
        .then<ApiResponse<UserWithAccessAndRefreshTokens>>(response => response.json());
    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.response;
};

export const updateUser = async (userId: string, userProfile: UserProfile): Promise<User> => {
    const response = await fetch(`${baseUrl}/user/v1/${userId}`, {
        method: 'PUT',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(userProfile)
    })
        .then<ApiResponse<User>>(response => response.json());
    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.response;
};

export const createMagicLinkToken = async (userId: string): Promise<UserWithMagicLinkToken> => {
    const response = await fetch(`${baseUrl}/user/v1/${userId}/magicLinkToken`, {
        method: 'GET'
    })
        .then<ApiResponse<UserWithMagicLinkToken>>(response => response.json());
    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.response;
};
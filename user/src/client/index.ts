import { get, post, put } from '../../../service/src/fetch';

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

export interface WithRefreshToken {
    refreshToken: string;
}

export interface WithAccessToken {
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

export const getUser = (key, userId: string) =>
    get<User>(key, `/user/v1/${userId}`);

export const getUserByAccessToken = (key, accessToken: string) =>
    get<User>(key, `/user/v1/${accessToken}`);

export const getUserByRefreshToken = (key, refreshToken: string) =>
    get<UserWithAccessToken>(key, `/user/v1/${refreshToken}`);

export const getUserByMagicLinkToken = (key, magicLinkToken: string) =>
    get<UserWithAccessAndRefreshTokens>(key, `/user/v1/${magicLinkToken}`);

export const getUserByEmailAddress = (key, emailAddress: string) =>
    get<User>(key, `/user/v1/${emailAddress}`);

export const createUser = (key, userId: string, userProfile: UserProfile) =>
    post<UserWithAccessAndRefreshTokens>(key, `/user/v1/`, { userId, ...userProfile });

export const updateUser = (key, userId: string, userProfile: UserProfile) =>
    post<User>(key, `/user/v1/${userId}`, userProfile);

export const sendMagicLinkEmail = (key, emailAddress: string) =>
    post<{}>(key, `/user/v1/magicLink/${emailAddress}`, {});

export const TEST_DATA_USER_ID = 'c50234ff-6c33-4878-a1ab-05f6b3e7b649';

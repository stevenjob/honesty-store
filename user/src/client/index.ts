import fetch from '../../../service/src/fetch';

export interface User {
  id: string;
  accountId?: string;
  defaultStoreId: string;
  emailAddress?: string;
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

const { get, post, put } = fetch('user');

export const getUser = (key, userId: string) =>
  get<User>(1, key, `/${userId}`);

export const getUserByAccessToken = (key, accessToken: string) =>
  get<User>(1, key, `/accessToken/${accessToken}`);

export const getUserByRefreshToken = (key, refreshToken: string) =>
  get<UserWithAccessToken>(1, key, `/refreshToken/${refreshToken}`);

export const getUserByMagicLinkToken = (key, magicLinkToken: string) =>
  get<UserWithAccessAndRefreshTokens>(1, key, `/magicLink/${magicLinkToken}`);

export const getUserByEmailAddress = (key, emailAddress: string) =>
  get<User>(1, key, `/emailAddress/${emailAddress}`);

export const createUser = (key, userId: string, userProfile: UserProfile) =>
  post<UserWithAccessAndRefreshTokens>(1, key, '/', { userId, ...userProfile });

export const updateUser = (key, userId: string, userProfile: UserProfile) =>
  put<User>(1, key, `/${userId}`, userProfile);

export const userRegistered = (user: User) => user.emailAddress != null;

export const sendMagicLinkEmail = (key, emailAddress: string, storeCode) =>
  post<{}>(1, key, `/magicLink/${emailAddress}/${storeCode}`, {});

export const logout = async (key, userId: string) =>
  post<{}>(1, key, `/logout/${userId}`, {});

export const TEST_DATA_USER_ID = 'c50234ff-6c33-4878-a1ab-05f6b3e7b649';

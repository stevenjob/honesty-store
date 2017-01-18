import uuid = require('uuid/v4');
import winston = require('winston');
import { secretKey } from '../constants'
import * as UserClient from '../../../user/src/client/index';
import { storeCodeToStoreID } from './store'

export const getUser = UserClient.getUser;

export const registerUser = async (defaultStoreCode) => {
  const userId = uuid();
  const profile = {
    defaultStoreId: storeCodeToStoreID(defaultStoreCode),
  };
  return await UserClient.createUser(userId, profile)
};

export const getUserIDFromAccessToken = async (accessToken) => {
  const { id } = await UserClient.getUserByAccessToken(accessToken);
  return { id };
};

export const getUserIDAndAccessTokenFromRefreshToken = async (refreshToken) => {
  const { id, accessToken } = await UserClient.getUserByRefreshToken(refreshToken);
  return { id, accessToken };
};

export const getUserIDAndAccessAndRefreshTokensFromEmailToken = async (emailToken) => {
  const { id, accessToken, refreshToken } = await UserClient.getUserByMagicLinkToken(emailToken);
  return { id, accessToken, refreshToken };
};

export const updateUser = async (id, emailAddress) => {
  await updateUser(id, { emailAddress });
};

export const updateDefaultStoreCode = async (userID, storeCode) => {
  await updateUser(userID, { defaultStoreCode: storeCode });
};

export const expireRefreshToken = async (userID) => {
    throw new Error(`logout not supported yet (expireRefreshToken())`);
};

export const sendEmailToken = async (emailAddress) => {
  await UserClient.sendMagicLinkEmail(emailAddress);
  winston.info(`send email token to ${emailAddress}`);
};

export const getUsersAccountId = async (userId: string): Promise<string> => {
    return (await UserClient.getUser(userId)).accountId;
}

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
  return await UserClient.getUserByAccessToken(accessToken);
};

export const getUserIDAndAccessTokenFromRefreshToken = async (refreshToken) => {
  return await UserClient.getUserByRefreshToken(refreshToken);
};

export const getUserIDAndAccessAndRefreshTokensFromEmailToken = async (emailToken) => {
  return await UserClient.getUserByMagicLinkToken(emailToken);
};

export const updateUser = async (id, emailAddress) => {
  return await UserClient.updateUser(id, { emailAddress });
};

export const updateDefaultStoreCode = async (userID, storeCode) => {
  return await updateUser(userID, { defaultStoreCode: storeCode });
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

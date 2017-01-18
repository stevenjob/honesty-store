import uuid = require('uuid/v4');
import winston = require('winston');
import { secretKey } from '../constants'
import * as UserClient from '../../../user/src/client/index';
import { storeCodeToStoreID } from './store'

export const getUser = UserClient.getUser;

const generateRefreshToken = () => jsonwebtoken.sign(uuid(), secretKey);

export const registerUser = async (defaultStoreCode) => {
  const userId = uuid();
  const refreshToken = generateRefreshToken();

  const profile = {
    defaultStoreId: storeCodeToStoreID(defaultStoreCode),
  };
  return await UserClient.createUser(userId, profile)
};

export const getUserIDFromAccessToken = async (accessToken) => {
  return (await UserClient.getUserByAccessToken(accessToken)).id;
};

export const getUserIDFromRefreshToken = async (refreshToken) => {
  return (await UserClient.getUserByRefreshToken(refreshToken)).id;
};

export const getUserIDFromEmailToken = async (emailToken) => {
  return (await UserClient.getUserByMagicLinkToken(emailToken)).id;
};

export const updateUser = async (id, emailAddress) => {
  await updateUser(id, { emailAddress });
};

export const updateAccessToken = async (userID): Promise<UserClient.UserWithAccessToken> => { // TODO
  const newAccessToken = generateExpirableToken();

  return {
      ...await UserClient.getUser(userID),
      accessToken: newAccessToken,
  };
};

export const updateRefreshToken = async (userID): Promise<UserClient.UserWithRefreshToken> => {
  const newRefreshToken = generateRefreshToken(); // TODO

  return {
      ...await UserClient.getUser(userID),
      refreshToken: newRefreshToken,
  };
};

export const updateDefaultStoreCode = async (userID, storeCode) => {
  await updateUser(userID, { defaultStoreCode: storeCode });
};

export const expireRefreshToken = async (userID) => { // TODO
  return {
    ...await UserClient.getUser(userID),
    refreshToken: undefined
  };
};

export const sendEmailToken = async (emailAddress) => {
  const user = await UserClient.getUserByEmailAddress(emailAddress);
  const token = await UserClient.createMagicLinkToken(user.id);

  /* When the eventual service is added, the 'emailToken' will be sent via email */
  winston.info(`Generated email token: ${token}`);
};

export const getUsersAccountId = async (userId: string): Promise<string> => {
    return (await UserClient.getUser(userId)).accountId;
}

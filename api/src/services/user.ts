import uuid = require('uuid/v4');
import winston = require('winston');
import { secretKey } from '../constants'
import { sendMagicLinkEmail, createUser, getUserByAccessToken,
    getUserByEmailAddress, getUserByMagicLinkToken, getUserByRefreshToken,
    updateUser } from '../../../user/src/client/index';
import { storeCodeToStoreID } from './store'

export const registerUser = async (defaultStoreCode) => {
  const userId = uuid();
  const profile = {
    defaultStoreId: storeCodeToStoreID(defaultStoreCode),
  };
  return await createUser(userId, profile)
};

export const expireRefreshToken = async (userID) => {
    throw new Error(`logout not supported yet (expireRefreshToken())`);
};

export const sendEmailToken = async (emailAddress) => {
  await sendMagicLinkEmail(emailAddress);
  winston.info(`send email token to ${emailAddress}`);
};

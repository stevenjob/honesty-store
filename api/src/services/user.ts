import jsonwebtoken = require('jsonwebtoken');
import uuid = require('uuid/v4');
import winston = require('winston');
import { secretKey } from '../constants'

const generateExpirableToken = () => {
  const data = { uuid: uuid() };
  const options = { expiresIn: 300 };
  return jsonwebtoken.sign(data, secretKey, options);
};

const generateRefreshToken = () => jsonwebtoken.sign(uuid(), secretKey);

const users = [];
export { users as __users };

export const registerUser = (defaultStoreCode) => {
  const user = {
    id: uuid(),
    refreshToken: generateRefreshToken(),
    accessToken: generateExpirableToken(),
    defaultStoreCode,
  };

  users.push(user);

  return user;
};

export const getUserIDFromAccessToken = (accessToken) => {
  const foundUser = users.find(element => element.accessToken === accessToken);
  if (foundUser == null) {
    throw new Error(`No user found with access token '${accessToken}'`);
  }
  return foundUser.id;
};

export const getUserIDFromRefreshToken = (refreshToken) => {
  const foundUser = users.find(element => element.refreshToken === refreshToken);
  if (foundUser == null) {
    throw new Error(`No user found with refresh token '${refreshToken}'`);
  }
  return foundUser.id;
};

export const getUserIDFromEmailToken = (emailToken) => {
  const foundUser = users.find(element => element.emailToken === emailToken);
  if (foundUser == null) {
    throw new Error(`No user found with email token '${emailToken}`);
  }
  return foundUser.id;
};

export const getUser = id => users.find(element => element.id === id);

export const updateUser = (id, emailAddress, cardDetails) => {
  const user = getUser(id);
  user.emailAddress = emailAddress;
  user.cardDetails = cardDetails;
};

export const updateCardDetails = (id, cardDetails) => {
  const user = getUser(id);
  user.cardDetails = cardDetails;
};

export const updateAccessToken = (userID) => {
  const newAccessToken = generateExpirableToken();

  const user = getUser(userID);
  user.accessToken = newAccessToken;

  return user;
};

export const updateRefreshToken = (userID) => {
  const newRefreshToken = generateRefreshToken();

  const user = getUser(userID);
  user.refreshToken = newRefreshToken;

  return user;
};

export const updateDefaultStoreCode = (userID, storeCode) => {
  const user = getUser(userID);
  user.defaultStoreCode = storeCode;
};

export const expireRefreshToken = (userID) => {
  const user = getUser(userID);
  user.refreshToken = null;
};

export const sendEmailToken = (emailAddress) => {
  const user = users.find(element => element.emailAddress === emailAddress);
  if (user == null) {
    winston.warn(`User does not exist with email address '${emailAddress}'`);
    return;
  }

  const emailToken = generateExpirableToken();
  user.emailToken = emailToken;

  /* When the eventual service is added, the 'emailToken' will be sent via email */
  winston.info(`Generated email token: ${emailToken}`);
};

export const getUsersAccountId = async (userId: string): Promise<string> => {
    return (await getUser(userId)).accountId;
}

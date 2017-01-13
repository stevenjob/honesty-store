import jsonwebtoken = require('jsonwebtoken');
import uuid = require('uuid/v4');
import winston = require('winston');
const { secretKey } = require('../constants');

const generateExpirableToken = () => {
  const data = { uuid: uuid() };
  const options = { expiresIn: 300 };
  return jsonwebtoken.sign(data, secretKey, options);
};

const generateRefreshToken = () => jsonwebtoken.sign(uuid(), secretKey);

const users = [];

const registerUser = (defaultStoreCode) => {
  const user = {
    id: uuid(),
    refreshToken: generateRefreshToken(),
    accessToken: generateExpirableToken(),
    defaultStoreCode,
  };

  users.push(user);

  return user;
};

const getUserIDFromAccessToken = (accessToken) => {
  const foundUser = users.find(element => element.accessToken === accessToken);
  if (foundUser == null) {
    throw new Error(`No user found with access token '${accessToken}'`);
  }
  return foundUser.id;
};

const getUserIDFromRefreshToken = (refreshToken) => {
  const foundUser = users.find(element => element.refreshToken === refreshToken);
  if (foundUser == null) {
    throw new Error(`No user found with refresh token '${refreshToken}'`);
  }
  return foundUser.id;
};

const getUserIDFromEmailToken = (emailToken) => {
  const foundUser = users.find(element => element.emailToken === emailToken);
  if (foundUser == null) {
    throw new Error(`No user found with email token '${emailToken}`);
  }
  return foundUser.id;
};

const getUser = id => users.find(element => element.id === id);

const updateUser = (id, emailAddress, cardDetails) => {
  const user = getUser(id);
  user.emailAddress = emailAddress;
  user.cardDetails = cardDetails;
};

const updateCardDetails = (id, cardDetails) => {
  const user = getUser(id);
  user.cardDetails = cardDetails;
};

const updateAccessToken = (userID) => {
  const newAccessToken = generateExpirableToken();

  const user = getUser(userID);
  user.accessToken = newAccessToken;

  return user;
};

const updateRefreshToken = (userID) => {
  const newRefreshToken = generateRefreshToken();

  const user = getUser(userID);
  user.refreshToken = newRefreshToken;

  return user;
};

const updateDefaultStoreCode = (userID, storeCode) => {
  const user = getUser(userID);
  user.defaultStoreCode = storeCode;
};

const expireRefreshToken = (userID) => {
  const user = getUser(userID);
  user.refreshToken = null;
};

const sendEmailToken = (emailAddress) => {
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

module.exports = {
  registerUser,
  updateUser,
  sendEmailToken,
  getUserIDFromAccessToken,
  getUserIDFromRefreshToken,
  getUserIDFromEmailToken,
  getUser,
  updateRefreshToken,
  updateAccessToken,
  updateCardDetails,
  updateDefaultStoreCode,
  expireRefreshToken,
  __users: users,
};

const jsonwebtoken = require('jsonwebtoken');
const uuid = require('uuid/v4');
const winston = require('winston');
const { secretKey } = require('../constants');

const generateExpirableToken = () => {
  const data = { uuid: uuid() };
  const options = { expiresIn: 300 };
  return jsonwebtoken.sign(data, secretKey, options);
};

const generateRefreshToken = () => jsonwebtoken.sign(uuid(), secretKey);

const users = [];

const registerAccount = (defaultStoreCode) => {
  const account = {
    id: uuid(),
    refreshToken: generateRefreshToken(),
    accessToken: generateExpirableToken(),
    defaultStoreCode,
  };

  users.push(account);

  return account;
};

const getAccountIDFromAccessToken = (accessToken) => {
  const foundAccount = users.find(element => element.accessToken === accessToken);
  if (foundAccount == null) {
    throw new Error(`No account found with access token '${accessToken}'`);
  }
  return foundAccount.id;
};

const getAccountIDFromRefreshToken = (refreshToken) => {
  const foundAccount = users.find(element => element.refreshToken === refreshToken);
  if (foundAccount == null) {
    throw new Error(`No account found with refresh token '${refreshToken}'`);
  }
  return foundAccount.id;
};

const getAccountIDFromEmailToken = (emailToken) => {
  const foundAccount = users.find(element => element.emailToken === emailToken);
  if (foundAccount == null) {
    throw new Error(`No account found with email token '${emailToken}`);
  }
  return foundAccount.id;
};

const getAccount = id => users.find(element => element.id === id);

const updateAccount = (id, emailAddress, cardDetails) => {
  const account = getAccount(id);
  account.emailAddress = emailAddress;
  account.cardDetails = cardDetails;
};

const updateCardDetails = (id, cardDetails) => {
  const account = getAccount(id);
  account.cardDetails = cardDetails;
};

const updateAccessToken = (userID) => {
  const newAccessToken = generateExpirableToken();

  const account = getAccount(userID);
  account.accessToken = newAccessToken;

  return account;
};

const updateRefreshToken = (userID) => {
  const newRefreshToken = generateRefreshToken();

  const account = getAccount(userID);
  account.refreshToken = newRefreshToken;

  return account;
};

const updateDefaultStoreCode = (userID, storeCode) => {
  const account = getAccount(userID);
  account.defaultStoreCode = storeCode;
};

const expireRefreshToken = (userID) => {
  const account = getAccount(userID);
  account.refreshToken = null;
};

const sendEmailToken = (emailAddress) => {
  const account = users.find(element => element.emailAddress === emailAddress);
  if (account == null) {
    winston.warn(`Account does not exist with email address '${emailAddress}'`);
    return;
  }

  const emailToken = generateExpirableToken();
  account.emailToken = emailToken;

  /* When the eventual service is added, the 'emailToken' will be sent via email */
  winston.info(`Generated email token: ${emailToken}`);
};

module.exports = {
  registerAccount,
  updateAccount,
  sendEmailToken,
  getAccountIDFromAccessToken,
  getAccountIDFromRefreshToken,
  getAccountIDFromEmailToken,
  getAccount,
  updateRefreshToken,
  updateAccessToken,
  updateCardDetails,
  updateDefaultStoreCode,
  expireRefreshToken,
  __users: users,
};

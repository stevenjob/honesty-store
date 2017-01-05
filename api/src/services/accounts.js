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

const accounts = [];

const registerAccount = (defaultStoreCode) => {
  const account = {
    id: uuid(),
    balance: 0,
    refreshToken: generateRefreshToken(),
    accessToken: generateExpirableToken(),
    defaultStoreCode,
  };

  accounts.push(account);

  return account;
};

const getAccountIDFromAccessToken = (accessToken) => {
  const foundAccount = accounts.find(element => element.accessToken === accessToken);
  if (foundAccount == null) {
    throw new Error(`No account found with access token '${accessToken}'`);
  }
  return foundAccount.id;
};

const getAccountIDFromRefreshToken = (refreshToken) => {
  const foundAccount = accounts.find(element => element.refreshToken === refreshToken);
  if (foundAccount == null) {
    throw new Error(`No account found with refresh token '${refreshToken}'`);
  }
  return foundAccount.id;
};

const getAccountIDFromEmailToken = (emailToken) => {
  const foundAccount = accounts.find(element => element.emailToken === emailToken);
  if (foundAccount == null) {
    throw new Error(`No account found with email token '${emailToken}`);
  }
  return foundAccount.id;
};

const getAccount = id => accounts.find(element => element.id === id);

const updateAccount = (id, emailAddress, cardDetails) => {
  const account = getAccount(id);
  account.emailAddress = emailAddress;
  account.cardDetails = cardDetails;
};

const getCardNumber = userID => getAccount(userID).cardDetails;
const getDefaultStoreCode = userID => getAccount(userID).defaultStoreCode;
const getAccessToken = (userID) => {
  const newAccessToken = generateExpirableToken();

  const account = getAccount(userID);
  account.accessToken = newAccessToken;

  return newAccessToken;
};

const sendEmailToken = (emailAddress) => {
  const account = accounts.find(element => element.emailAddress === emailAddress);
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
  getCardNumber,
  getDefaultStoreCode,
  getAccessToken,
  __accounts: accounts,
};

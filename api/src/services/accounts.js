const jsonwebtoken = require('jsonwebtoken');
const uuid = require('uuid/v4');
const { secretKey } = require('../constants');

const generateAccessToken = () => {
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
    accessToken: generateAccessToken(),
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

const getAccount = id => accounts.find(element => element.id === id);

const updateAccount = (id, emailAddress, cardDetails) => {
  const account = getAccount(id);
  account.emailAddress = emailAddress;
  account.cardDetails = cardDetails;
};

const getCardNumber = userID => getAccount(userID).cardDetails;
const getDefaultStoreCode = userID => getAccount(userID).defaultStoreCode;
const getAccessToken = (userID) => {
  const newAccessToken = generateAccessToken();

  const account = getAccount(userID);
  account.accessToken = newAccessToken;

  return newAccessToken;
};

module.exports = {
  registerAccount,
  updateAccount,
  getAccountIDFromAccessToken,
  getAccountIDFromRefreshToken,
  getCardNumber,
  getDefaultStoreCode,
  getAccessToken,
  __accounts: accounts,
};

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

const registerAccount = (defaultStoreID) => {
  const account = {
    id: uuid(),
    balance: 0,
    refreshToken: generateRefreshToken(),
    accessToken: generateAccessToken(),
    defaultStoreID,
  };

  accounts.push(account);

  return account;
};

const getAccountID = (accessToken) => {
  const foundAccount = accounts.find(element => element.accessToken === accessToken);
  if (foundAccount != null) {
    return foundAccount.id;
  }
  return undefined;
};

const getAccount = id => accounts.find(element => element.id === id);

const updateAccount = (id, emailAddress, cardDetails) => {
  const account = getAccount(id);
  account.emailAddress = emailAddress;
  account.cardDetails = cardDetails;
};

module.exports = { registerAccount, updateAccount, getAccountID, __accounts: accounts };

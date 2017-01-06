const transactions = new Map();

const createTransaction = (type, amount) => {
  const transaction = { date: Date.now(), amount, type };
  return transaction;
};

const addTransaction = (transaction, userID) => {
  const userTransactions = transactions.get(userID) || [];
  userTransactions.push(transaction);
  transactions.set(userID, userTransactions);
};

const addItemTransaction = (userID, itemPrice) => {
  const transaction = createTransaction('purchase', -itemPrice);
  addTransaction(transaction, userID);
};

const addTopUpTransaction = (userID, amount) => {
  const transaction = createTransaction('topup', amount);
  addTransaction(transaction, userID);
};

// No concept of paging these transactions yet
const getTransactionHistory = userID => transactions.get(userID) || [];

const getBalance = (userID) => {
  const userTransactions = getTransactionHistory(userID);
  return userTransactions.reduce((balance, transaction) => balance + transaction.amount, 0);
};

module.exports = {
  addItemTransaction,
  addTopUpTransaction,
  getBalance,
  getTransactionHistory,
};

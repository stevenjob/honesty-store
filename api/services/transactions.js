const transactions = new Map();

const addItemTransaction = (userID, itemPrice) => {
  const userTransactions = transactions.get(userID) || [];

  const transaction = {
    date: Date.now(),
    amount: -itemPrice,
  };
  userTransactions.push(transaction);
  transactions.set(userID, userTransactions);
};

// No concept of paging these transactions yet
const getTransactionHistory = userID => transactions.get(userID) || [];

const getBalance = (userID) => {
  const userTransactions = getTransactionHistory(userID);
  return userTransactions.reduce((balance, transaction) => balance + transaction.amount, 0);
};

module.exports = { addItemTransaction, getBalance, getTransactionHistory };

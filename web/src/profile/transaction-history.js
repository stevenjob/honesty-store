import React from 'react';
import { connect } from 'react-redux';
import { BackToPage } from '../chrome/link';
import List from '../chrome/list';
import Full from '../layout/full';
import Transaction from './transaction';

const itemRenderer = transaction => <Transaction transaction={transaction} />;

const TransactionHistory = ({ transactions, balance }) => (
  <Full left={<BackToPage title="Profile" path="/profile" />}>
    <List data={transactions} itemRenderer={itemRenderer} />
  </Full>
);

const mapStateToProps = ({ user: { transactions, balance } }) => {
  const refundTransactions = transactions.filter(
    ({ type }) => type === 'refund'
  );
  const mergedTransactions = transactions.filter(
    ({ id, type, other }) =>
      !(type === 'purchase' &&
        refundTransactions.some(({ other }) => other === id))
  );

  return {
    transactions: mergedTransactions,
    balance: balance || 0
  };
};

export default connect(mapStateToProps)(TransactionHistory);

import React from 'react';
import { connect } from 'react-redux';
import List from '../chrome/list';
import Chrome from '../layout/chrome';
import HistoryItem from './item';
import Balance from '../topup/balance';

const itemRenderer = transaction => <HistoryItem transaction={transaction} />;

const History = ({ transactions, balance }) => (
  <Chrome title="History" right={<Balance balance={balance} />}>
    <List data={transactions} itemRenderer={itemRenderer} />
  </Chrome>
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
    transactions: mergedTransactions || [],
    balance: balance || 0
  };
};

export default connect(mapStateToProps)(History);

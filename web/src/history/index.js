import React from 'react';
import { connect } from 'react-redux';
import List from '../chrome/list';
import Page from '../chrome/page';
import HistoryItem from './item';
import Balance from '../topup/balance';

const itemRenderer = (transaction) => <HistoryItem transaction={transaction} />;

const History = ({ transactions, balance }) => (
  <Page title="History"
    right={<Balance balance={balance} />}>
    <List data={transactions} itemRenderer={itemRenderer} />
  </Page>
);

const mapStateToProps = ({ user: { transactions, balance } }) => ({
  transactions: transactions || [],
  balance: balance || 0
});

export default connect(mapStateToProps)(History);

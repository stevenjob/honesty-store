import React from 'react';
import { connect } from 'react-redux';
import List from '../chrome/list';
import Page from '../chrome/page';
import HistoryItem from './item';

const itemRenderer = (transaction) => <HistoryItem transaction={transaction}/>;

const History = ({ transactions = [], loading }) => (
  <Page title="History">
    <List data={transactions} itemRenderer={itemRenderer}/>
  </Page>
);

const mapStateToProps = ({ user: { transactions } }) => ({
  transactions
});

export default connect(mapStateToProps)(History);

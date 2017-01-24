import React from 'react';
import { connect } from 'react-redux';
// import List from '../chrome/list';
import Page from '../chrome/page';
import HistoryItem from './item';
import './index.css';

const History = ({ transactions = [], params: { storeId }, loading }) => (
  <Page title="History"
    storeId={storeId}
    loading={loading}>
    <ul className="history-list">
      { transactions.map((transaction, index) => <li key={index}><HistoryItem transaction={transaction}/></li>) }
    </ul>
  </Page>
);

const mapStateToProps = ({ pending, user: { transactions } }) => ({
  loading: pending.length > 0,
  transactions
});

export default connect(mapStateToProps)(History);

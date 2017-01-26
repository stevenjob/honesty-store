import React from 'react';
import { connect } from 'react-redux';
import Page from '../chrome/page';
import HistoryItem from './item';
import './index.css';

const History = ({ transactions = [], loading }) => (
  <Page title="History">
    <ul className="history-list">
      { transactions.map((transaction, index) => <li key={index}><HistoryItem transaction={transaction}/></li>) }
    </ul>
  </Page>
);

const mapStateToProps = ({ user: { transactions } }) => ({
  transactions
});

export default connect(mapStateToProps)(History);

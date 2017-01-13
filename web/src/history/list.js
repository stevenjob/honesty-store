import React from 'react';
import { connect } from 'react-redux';
import List from '../chrome/list';
import './list.css';

const itemRenderer = (data, index) => (
  <b>{JSON.stringify(data)}</b>
);

const HistoryList = ({ transactions }) => (
  <List data={transactions} itemRenderer={itemRenderer}/>
);

const mapStateToProps = ({ user: { transactions } }) => ({ transactions });

export default connect(mapStateToProps)(HistoryList);

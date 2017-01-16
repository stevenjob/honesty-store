import React from 'react';
import { connect } from 'react-redux';
import List from '../chrome/list';
import Page from '../chrome/page';
import './index.css';

const itemRenderer = (data, index) => (
  <b>{JSON.stringify(data)}</b>
);

const History = ({ transactions, params: { storeId }, loading }) => (
  <Page title="History"
    storeId={storeId}
    loading={loading}>
    <List data={transactions} itemRenderer={itemRenderer}/>
  </Page>
);

const mapStateToProps = ({ pending, user: { transactions } }) => ({
  loading: pending.length > 0,
  transactions
});

export default connect(mapStateToProps)(History);

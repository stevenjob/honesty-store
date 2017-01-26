import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Page from '../chrome/page';
import List from '../chrome/list';
import StoreItem from './item';
import currency from '../format/currency';
import './index.css';

const Balance = ({ balance }) =>
    <Link to={`/topup`} className="store-title-balance">
      <small>Balance</small>
      <h1><small>£</small>{currency(balance)}</h1>
    </Link>;

const itemRenderer = () => {
  return (item, index) => <StoreItem item={item} image="packet.svg"/>;
};

const Store = ({ storeCode, balance, loading, items }) =>
  <Page title="Store"
    subtitle={`@${storeCode}`}
    right={<Balance balance={balance}/>}
    loading={loading}>
    <List data={items} itemRenderer={itemRenderer()}/>
  </Page>;

const mapStateToProps = ({ pending, user: { balance }, store: { code, items } }) => ({
  storeCode: code,
  loading: pending.length > 0,
  balance: balance || 0,
  items
});

export default connect(mapStateToProps)(Store);

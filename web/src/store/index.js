import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Page from '../chrome/page';
import List from '../chrome/list';
import StoreItem from './item';
import currency from '../format/currency';
import './index.css';

const Balance = ({ storeId, balance }) =>
    <Link to={`/${storeId}/topup`} className="store-title-balance">
      <small>Balance</small>
      <h1><small>£</small>{currency(balance)}</h1>
    </Link>;

const itemRenderer = (item, index) => (
  <StoreItem image="packet.svg" name={item.name} price={item.price}/>
);

const Store = ({ params: { storeId }, balance, loading, items }) =>
  <Page title="Store"
    subtitle={`@${storeId}`}
    right={<Balance balance={balance} storeId={storeId}/>}
    storeId={storeId}
    loading={loading}>
    <List data={items} itemRenderer={itemRenderer}/>
  </Page>;

const mapStateToProps = ({ pending, user: { balance }, store: { items } }) => ({
  loading: pending.length > 0,
  balance: balance || 0,
  items
});

export default connect(mapStateToProps)(Store);

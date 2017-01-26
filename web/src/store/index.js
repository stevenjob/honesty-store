import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Page from '../chrome/page';
import List from '../chrome/list';
import StoreItem from './item';
import currency from '../format/currency';
import isRegistedUser from '../reducers/is-registered-user';
import './index.css';

const Help = () =>
  <Link to={`/help`} className="store-title-help">
    <h5>Help</h5>
  </Link>;

const Balance = ({ balance }) =>
    <Link to={`/topup`} className="store-title-balance">
      <small>Balance</small>
      <h1><small>£</small>{currency(balance)}</h1>
    </Link>;

const itemRenderer = (item, index) => <StoreItem item={item}/>;

const Store = ({ registered, storeCode, balance, loading, items }) =>
  <Page title="Store"
    subtitle={storeCode ? `@${storeCode}` : ''}
    right={registered ? <Balance balance={balance}/> : <Help/>}
    nav={registered}>
    <List data={items} itemRenderer={itemRenderer}/>
  </Page>;

const mapStateToProps = ({ user, store: { code, items } }) => ({
  registered: isRegistedUser(user),
  storeCode: code,
  balance: user.balance || 0,
  items
});

export default connect(mapStateToProps)(Store);

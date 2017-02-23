import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Chrome from '../layout/chrome';
import List from '../chrome/list';
import StoreItem from './item';
import isRegistedUser from '../reducers/is-registered-user';
import Balance from '../topup/balance';

const Help = () =>
  <Link className="btn" to="/help">Help</Link>;

const SignIn = () =>
  <Link className="btn" to="/register">Sign In</Link>;

const itemRenderer = (item, index) => <StoreItem item={item} />;

const Store = ({ registered, storeCode, balance, items }) =>
  <Chrome title={storeCode || 'Store'}
    right={registered ? <Balance balance={balance}/> : <Help />}
    left={!registered && <SignIn />}
    nav={registered}>
    <List data={items} itemRenderer={itemRenderer} />
  </Chrome>;

const mapStateToProps = ({ user, store: { code, items } }) => ({
  registered: isRegistedUser(user),
  storeCode: code,
  balance: user.balance || 0,
  items
});

export default connect(mapStateToProps)(Store);

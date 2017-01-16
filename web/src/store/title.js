import React from 'react';
import { connect } from 'react-redux';
import TitleBar from '../chrome/title-bar';
import './title.css';

const Balance = ({ balance }) => {
  const formattedBalance = (balance/100).toFixed(2);
  return (
    <div className="store-title-balance">
      <small>Balance</small>
      <h1><small>£</small>{formattedBalance}</h1>
    </div>
  );
};

const StoreTitle = (props) => (
  <TitleBar
    title="Store" 
    subtitle={`@${props.params.storeId}`} 
    right={<Balance balance={props.balance}/>} 
  />
);

const mapStateToProps = (state) => {
  const balance = state.user.balance || 0;
  return { balance };
};

export default connect(mapStateToProps)(StoreTitle);
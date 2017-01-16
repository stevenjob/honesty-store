import React from 'react';
import TitleBar from '../chrome/title-bar';
import './title.css';

const Balance = () => <div className="store-title-balance">
  <small>Balance</small>
  <h1><small>£</small>6.45</h1>
</div>;

export default ({ params: { storeId } }) => (
  <TitleBar title="Store" subtitle={`@${storeId}`} right={<Balance />} />
);



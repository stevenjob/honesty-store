import React from 'react';
import { Link } from 'react-router';
import Currency from '../format/Currency';

export default ({ balance }) =>
  <Link to={`/topup`} className="store-title-balance">
    <small>Balance</small>
    <h1>
      <Currency amount={balance} />
    </h1>
  </Link>;

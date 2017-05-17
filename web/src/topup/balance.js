import React from 'react';
import { Link } from 'react-router';
import Currency from '../format/Currency';

export default ({ balance }) => (
  <Link className="btn" to="/topup">
    <small className="h6">Balance</small>
    <br />
    <Currency amount={balance} />
  </Link>
);

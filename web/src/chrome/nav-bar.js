import React from 'react';
import { Link } from 'react-router'
import { BRAND_WHITE } from './colors';
import './nav-bar.css'

export default ({ storeId }) => (
  <nav className="chrome-nav-bar" style={{ background: BRAND_WHITE }}>
    <div style={{ background: BRAND_WHITE }}>
      <Link to={`/${storeId}/store`}>Store</Link>
      <Link to={`/${storeId}/history`}>History</Link>
      <Link to={`/${storeId}/profile`}>Profile</Link>
      <Link to={`/${storeId}/help`}>Help</Link>
    </div>
  </nav>
);

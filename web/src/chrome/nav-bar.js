import React from 'react';
import { Link } from 'react-router'
import { BRAND_DARK, BRAND_WHITE, MUTED_TEXT } from './colors';
import './nav-bar.css'

export default ({ storeId }) => (
  <nav className="chrome-nav-bar" style={{ background: BRAND_WHITE }}>
    <div style={{ background: BRAND_WHITE }}>
      <Link to={`/${storeId}/store`} style={{ color: MUTED_TEXT }} activeStyle={{ color: BRAND_DARK }}>Store</Link>
      <Link to={`/${storeId}/history`} style={{ color: MUTED_TEXT }} activeStyle={{ color: BRAND_DARK }}>History</Link>
      <Link to={`/${storeId}/profile`} style={{ color: MUTED_TEXT }} activeStyle={{ color: BRAND_DARK }}>Profile</Link>
      <Link to={`/${storeId}/help`} style={{ color: MUTED_TEXT }} activeStyle={{ color: BRAND_DARK }}>Help</Link>
    </div>
  </nav>
);

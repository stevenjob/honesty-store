import React from 'react';
import { Link } from 'react-router'
import { BRAND_DARK, BRAND_WHITE, MUTED_TEXT } from './colors';
import './nav-bar.css'

const NavLink = ({ path, label, storeId }) => (
  <Link to={`/${storeId}${path}`}
    style={{ color: MUTED_TEXT }}
    activeStyle={{ color: BRAND_DARK }}>
    {label}
  </Link>
);

export default ({ storeId }) => (
  <nav className="chrome-nav-bar" style={{ background: BRAND_WHITE }}>
    <div style={{ background: BRAND_WHITE }}>
      <NavLink storeId={storeId} path="/store" label="Store"/>
      <NavLink storeId={storeId} path="/history" label="History"/>
      <NavLink storeId={storeId} path="/profile" label="Profile"/>
      <NavLink storeId={storeId} path="/help" label="Help"/>
    </div>
  </nav>
);

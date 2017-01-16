import React from 'react';
import { Link } from 'react-router';
import { BRAND_DARK, BRAND_WHITE, MUTED_TEXT } from './colors';
import './nav-bar.css';

const NavLink = ({ path, icon, label, storeId }) => (
  <Link to={`/${storeId}${path}`}
    style={{ color: MUTED_TEXT }}
    activeStyle={{ color: BRAND_DARK }}
    activeClassName="chrome-nav-bar-active">
    <i className={`chrome-nav-bar-icon-${icon}`}></i>
    {label}
  </Link>
);

export default ({ storeId }) => (
  <nav className="chrome-nav-bar" style={{ background: BRAND_WHITE, borderColor: MUTED_TEXT }}>
    <NavLink storeId={storeId} path="/store" icon="store" label="Store"/>
    <NavLink storeId={storeId} path="/history" icon="history" label="History"/>
    <NavLink storeId={storeId} path="/profile" icon="profile" label="Profile"/>
    <NavLink storeId={storeId} path="/help" icon="help" label="Help"/>
  </nav>
);

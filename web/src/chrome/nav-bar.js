import React from 'react';
import { Link } from 'react-router';
import { BRAND_DARK, BRAND_WHITE, MUTED_TEXT } from './colors';
import './nav-bar.css';

const NavLink = ({ path, icon, label }) => (
  <Link to={`${path}`}
    style={{ color: MUTED_TEXT }}
    activeStyle={{ color: BRAND_DARK }}
    activeClassName="chrome-nav-bar-active">
    <i className={`chrome-nav-bar-icon-${icon}`}></i>
    {label}
  </Link>
);

export default () => (
  <nav className="chrome-nav-bar" style={{ background: BRAND_WHITE, borderColor: MUTED_TEXT }}>
    <NavLink path="/store" icon="store" label="Store"/>
    <NavLink path="/history" icon="history" label="History"/>
    <NavLink path="/profile" icon="profile" label="Profile"/>
    <NavLink path="/help" icon="help" label="Help"/>
  </nav>
);

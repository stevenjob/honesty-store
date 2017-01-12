import React from 'react';
import { BRAND_WHITE } from './colors';
import './nav-bar.css'

export default () => (
  <nav className="chrome-nav-bar" style={{ background: BRAND_WHITE }}>
    <div style={{ background: BRAND_WHITE }}>
      <a href="#">Store</a>
      <a href="#">History</a>
      <a href="#">Profile</a>
      <a href="#">Help</a>
    </div>
  </nav>
);

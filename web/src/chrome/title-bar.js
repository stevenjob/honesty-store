import React from 'react';
import { BRAND_DARK, BRAND_WHITE, LIGHT_TEXT } from './colors';
import './title-bar.css'

export default () => (
  <header className="chrome-title-bar" style={{ background: BRAND_WHITE }}>
    <div style={{ background: BRAND_DARK, color: LIGHT_TEXT }}>
      <h1>Store</h1>
      <h2>@SL-NCL</h2>
    </div>
  </header>
);

import React from 'react';
import { BRAND_DARK, BRAND_WHITE, LIGHT_TEXT } from './colors';
import './title-bar.css'

export default ({ title, subtitle }) => (
  <header className="chrome-title-bar" style={{ background: BRAND_WHITE }}>
    <div style={{ background: BRAND_DARK, color: LIGHT_TEXT }}>
      <h1>{title}</h1>
      <h2>{subtitle}</h2>
    </div>
  </header>
);

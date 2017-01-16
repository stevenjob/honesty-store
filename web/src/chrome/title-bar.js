import React from 'react';
import { BRAND_DARK, BRAND_WHITE, LIGHT_TEXT } from './colors';
import './title-bar.css';

export default ({ title, subtitle, left, right }) => (
  <header className="chrome-title-bar" style={{ border: BRAND_WHITE, background: BRAND_DARK, color: LIGHT_TEXT }}>
  { (right || left) &&
      <div className="chrome-title-bar-left">
        { left }
      </div>
    }
    <div className="chrome-title-bar-middle">
      <h1>{title}</h1>
      { subtitle &&
        <h2>{subtitle}</h2>
      }
    </div>
    { (right || left) &&
      <div className="chrome-title-bar-right">
        { right }
      </div>
    }
  </header>
);

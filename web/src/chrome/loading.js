import React from 'react';
import MiscBar from '../item/misc-bar.js';
import MiscBigBar from '../item/misc-big-bar.js';
import MiscCrisps from '../item/misc-crisps.js';
import './loading.css';

export default () => <div className="chrome-loading">
  <h1>Loading</h1>
  <div className="chrome-loading-items">
    <MiscBar/>
    <MiscCrisps/>
    <MiscBigBar/>
    <MiscBar/>
    <MiscBigBar/>
    <MiscCrisps/>
  </div>
</div>;
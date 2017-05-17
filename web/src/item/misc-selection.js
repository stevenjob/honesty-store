import React from 'react';
import MiscCrisps from './misc-crisps';
import './misc-selection.css';

export default ({ className = '', style = {} }) => (
  <div className={`item-misc-selection ${className}`} style={style}>

    <MiscCrisps className="item-misc-selection-left" />
    <MiscCrisps className="item-misc-selection-right" />
    <MiscCrisps className="item-misc-selection-center" />
  </div>
);

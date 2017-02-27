import React from 'react';
import MiscCrisps from './misc-crisps';

export default ({className = '', style = {}}) =>
  <svg className={className} style={style} version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140">
    <g transform="translate(30, 30) scale(0.5) rotate(-35, 70, 140)">
      <MiscCrisps />
    </g>
    <g transform="translate(40, 30) scale(0.5) rotate(35, 70, 140)">
      <MiscCrisps />
    </g>
    <g transform="translate(30, 35) scale(0.6)">
      <MiscCrisps />
    </g>
  </svg>;

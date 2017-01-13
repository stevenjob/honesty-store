import React from 'react';
import { MUTED_TEXT } from './colors';
import './list.css';

export default ({ data, itemRenderer }) => (
  <ul className="chrome-list">
    {
      data == null ? <p>'No Data'</p> :
      data.map((item, index) => (
          <li key={index} style={{borderColor: MUTED_TEXT }}>{itemRenderer(item, index)}</li>
      ))
    }
  </ul>
);

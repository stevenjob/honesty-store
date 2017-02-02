import React from 'react';
import { MUTED_TEXT, LIGHT_BACKGROUND } from './colors';
import './list.css';

export default ({ data, itemRenderer }) => (
  <ul
    className="chrome-list"
    style={{ borderBottomColor: MUTED_TEXT, backgroundColor: LIGHT_BACKGROUND }}
    >
    {
      data == null ? <p>'No Data'</p> :
        data.map((item, index) => (
          <li key={index} style={{ borderColor: MUTED_TEXT }}>{itemRenderer(item, index)}</li>
        ))
    }
  </ul>
);

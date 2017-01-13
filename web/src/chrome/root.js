import React from 'react';
import NavBar from './nav-bar';
import { BRAND_DARK } from './colors';
import './root.css'

export default ({ title, body, routeParams: { storeId } }) => (
  <div className="chrome-root">
    {title}
    <section style={{color: BRAND_DARK }}>
      {body}
    </section>
    <NavBar storeId={storeId}/>
  </div>
);

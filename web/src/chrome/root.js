import React from 'react';
import TitleBar from './title-bar';
import NavBar from './nav-bar';
import { BRAND_DARK } from './colors';
import './root.css'

export default ({ children, routeParams: { storeId } }) => (
  <div className="chrome-root">
    <TitleBar storeId={storeId}/>
    <section style={{color: BRAND_DARK }}>
      { children }
    </section>
    <NavBar storeId={storeId}/>
  </div>
);

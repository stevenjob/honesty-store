import React from 'react';
import TitleBar from './title-bar';
import List from './list';
import NavBar from './nav-bar';
import { BRAND_DARK } from './colors';
import './root.css'

const itemRenderer = (data, index) => (
  <b>{data}</b>
);

export default () => (
  <div className="chrome-root">
    <TitleBar />
    <section style={{color: BRAND_DARK }}>
      <List data={[1,2,3,4,5]} itemRenderer={itemRenderer}/>
    </section>
    <NavBar />
  </div>
);

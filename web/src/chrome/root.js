import React from 'react';
import { connect } from 'react-redux';
import NavBar from './nav-bar';
import { BRAND_DARK } from './colors';
import './root.css';

const Root = ({ loading, title, body, routeParams: { storeId } }) => (
  <div className="chrome-root">
    {title}
    <section style={{color: BRAND_DARK }}>
      { loading ? "Loading..." : body }
    </section>
    <NavBar storeId={storeId}/>
  </div>
);

const mapStateToProps = ({ pending }) => ({
  loading: pending.length > 0
});

export default connect(mapStateToProps)(Root);

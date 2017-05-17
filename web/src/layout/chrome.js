import React from 'react';
import { connect } from 'react-redux';
import { Store, History, Profile, Help } from './nav';
import isRegisteredUser from '../reducers/is-registered-user.js';

const Chrome = ({ title, left, right, children, nav }) => (
  <div className="sm-col-10 md-col-8 lg-col-6 mx-auto">
    <header className="fixed top-0 right-0 left-0 bg-navy border-silver border-bottom white z1">
      <div className="sm-col-10 md-col-8 lg-col-6 mx-auto flex items-center ">
        <div className="col-4 left-align">
          {left || '\u00a0'}
        </div>
        <h1 className="col-4 mt2 h3 mb2 center">
          {title || '\u00a0'}
        </h1>
        <div className="col-4 right-align">
          {right || '\u00a0'}
        </div>
      </div>
    </header>
    <section
      style={{
        paddingTop: '3.5625rem',
        paddingBottom: nav ? '3.3125rem' : '0'
      }}
    >
      {children}
    </section>
    {nav &&
      <nav className="fixed bottom-0 right-0 left-0 bg-silver border-gray border-top white">
        <div className="sm-col-10 md-col-8 lg-col-6 mx-auto flex justify-around">
          <Store
            className="inline-block btn btn-small line-height-1 center gray regular h6"
            style={{ width: '4rem' }}
          />
          <History
            className="inline-block btn btn-small line-height-1 center gray regular h6"
            style={{ width: '4rem' }}
          />
          <Profile
            className="inline-block btn btn-small line-height-1 center gray regular h6"
            style={{ width: '4rem' }}
          />
          <Help
            className="inline-block btn btn-small line-height-1 center gray regular h6"
            style={{ width: '4rem' }}
          />
        </div>
      </nav>}
  </div>
);

const mapStateToProps = ({ user }) => ({
  nav: isRegisteredUser(user)
});

export default connect(mapStateToProps, {})(Chrome);

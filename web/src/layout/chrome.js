import React from 'react';
import { connect } from 'react-redux';
import { Store, History, Profile, Help } from './nav';
import isRegisteredUser from '../reducers/is-registered-user.js';

const Chrome = ({
  title,
  left,
  right,
  children,
  nav
}) =>
  <div className="sm-col-10 md-col-8 lg-col-6 mx-auto">
    <header className="fixed top-0 right-0 left-0 bg-navy border-silver border-bottom white">
      <div className="sm-col-10 md-col-8 lg-col-6 mx-auto flex items-center ">
        <div className="col-4 left-align">
          {left || '\u00a0'}
        </div>
        <h1 className="col-4 mt2 mb2 center">
          {title || '\u00a0'}
        </h1>
        <div className="col-4 right-align">
          {right || '\u00a0'}
        </div>
      </div>
    </header>
    <section style={{ paddingTop: '4.5em', paddingBottom: nav ? '4.5em' : '0' }}>
      {children}
    </section>
    {nav &&
      <nav className="fixed bottom-0 right-0 left-0 bg-silver border-gray border-top white">
        <div className="sm-col-10 md-col-8 lg-col-6 mx-auto flex justify-around">
          <Store className="inline-block btn p1 center gray regular h6" style={{ width: '6em' }} />
          <History className="inline-block btn p1 center gray regular h6" style={{ width: '6em' }} />
          <Profile className="inline-block btn p1 center gray regular h6" style={{ width: '6em' }} />
          <Help className="inline-block btn p1 center gray regular h6" style={{ width: '6em' }} />
        </div>
      </nav>
    }
  </div>;

const mapStateToProps = ({ user }) => ({
  nav: isRegisteredUser(user)
});

export default connect(mapStateToProps, {})(Chrome);

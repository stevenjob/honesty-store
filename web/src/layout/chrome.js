import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';

import * as Logo from '../chrome/logo';
import isRegisteredUser from '../reducers/is-registered-user';

const navBgColor = '#29526d';
const navFgColorActive = '#ffffff';
const navFgColorInactive = '#7591a1';
const navBarColorActive = '#3fbcd5';

const NavLink = withRouter(({ to, className, router, children }) => (
  <Link
    to={to}
    className={`${className} center inline-block border-bottom border-white`}
    style={{
      background: navBgColor,
      borderBottomWidth: '0.2rem',
      color: navFgColorInactive
    }}
    onlyActiveOnIndex={true}
    activeStyle={{
      color: navFgColorActive,
      borderBottomColor: navBarColorActive
    }}
  >
    {children}
  </Link>
));

const Chrome = ({ storeCode, children, registered }) => (
  <div className="col-12 sm-col-10 md-col-8 lg-col-6 mx-auto">
    <div className="fixed top-0 col-12 sm-col-10 md-col-8 lg-col-6 mx-auto bg-navy border-silver white z1">
      <nav className="col-12">
        <NavLink
          className="py1 col col-2 align-top"
          to={registered ? '/store' : '/'}
        >
          <Logo.InvertedSmall style={{ height: '2em' }} />
        </NavLink>
        {registered
          ? <div className="col col-10">
              <NavLink className="py2 col-3" to="/store">Store</NavLink>
              <NavLink className="py2 col-3" to="/profile">Profile</NavLink>
              <NavLink className="py2 col-3" to="/history">History</NavLink>
              <NavLink className="py2 col-3" to="/help">Help</NavLink>
            </div>
          : <div className="col col-10">
              <NavLink className="py2 col-4" to="/store">Store</NavLink>
              <NavLink className="py2 col-4" to="/register">Sign In</NavLink>
              <NavLink className="py2 col-4" to="/help">Help</NavLink>
            </div>}
      </nav>
    </div>

    <section style={{ paddingTop: '3.6rem' }}>
      {children}
    </section>
  </div>
);

const mapStateToProps = ({ user, store: { code: storeCode } }) => ({
  storeCode,
  registered: isRegisteredUser(user)
});

export default connect(mapStateToProps, {})(Chrome);

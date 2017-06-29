import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';

import * as Logo from '../chrome/logo';
import isRegisteredUser from '../reducers/is-registered-user';

const navBarHeight = '3.4rem';

const NavLink = withRouter(({ to, className, router, children }) => (
  <Link
    to={to}
    className={`${className} center block border-bottom border-white gray`}
    activeClassName="border-aqua"
    activeStyle={{ color: 'white' }}
    style={{
      borderBottomWidth: '0.2rem',
      lineHeight: navBarHeight
    }}
    onlyActiveOnIndex={true}
  >
    {children}
  </Link>
));

const Chrome = ({ storeCode, children, registered }) => (
  <div className="col-12 sm-col-10 md-col-8 lg-col-6 mx-auto">
    <nav className="fixed top-0 col-12 sm-col-10 md-col-8 lg-col-6 mx-auto bg-navy white z1 flex items-center">
      <NavLink to={registered ? '/store' : '/'}>
        <Logo.InvertedSmall
          className="align-middle"
          style={{ height: '2rem', width: navBarHeight }}
        />
      </NavLink>
      <NavLink className="flex-auto" to="/store">Store</NavLink>
      {registered &&
        <NavLink className="flex-auto" to="/profile">Profile</NavLink>}
      {registered &&
        <NavLink className="flex-auto" to="/history">History</NavLink>}
      <NavLink className="flex-auto" to="/help">Help</NavLink>
      {!registered &&
        <NavLink className="flex-auto" to="/register">Sign In</NavLink>}
    </nav>

    <section style={{ paddingTop: navBarHeight }}>
      {children}
    </section>
  </div>
);

const mapStateToProps = ({ user, store: { code: storeCode } }) => ({
  storeCode,
  registered: isRegisteredUser(user)
});

export default connect(mapStateToProps, {})(Chrome);

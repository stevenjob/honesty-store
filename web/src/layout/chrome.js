import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';

import * as Logo from '../chrome/logo';
import Balance from '../topup/balance';
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

const Chrome = ({ storeCode, children, registered, balance }) => (
  <div className="col-12 sm-col-10 md-col-8 lg-col-6 mx-auto">
    <header className="bg-navy center pt4 pb2 relative">
      <div className="top-0 right-0 m1 white absolute">
        {registered
          ? <Balance balance={balance} />
          : <Link className="btn btn-big white" to="/register">Sign In</Link>}
      </div>
      <Logo.Inverted className="col-9 py1" />
      <h2 className="my0 white regular">{storeCode}</h2>
    </header>
    <div style={{ minHeight: '100vh' }}>
      <nav className="sticky top-0 bg-navy white flex items-center z1">
        <NavLink className="flex-auto" to="/store">Store</NavLink>
        {registered &&
          <NavLink className="flex-auto" to="/profile">Profile</NavLink>}
        {registered &&
          <NavLink className="flex-auto" to="/history">History</NavLink>}
        <NavLink className="flex-auto" to="/help">Help</NavLink>
      </nav>

      <section>
        {children}
      </section>
    </div>
  </div>
);

const mapStateToProps = ({ user, store: { code: storeCode } }) => ({
  storeCode,
  registered: isRegisteredUser(user),
  balance: user.balance || 0
});

export default connect(mapStateToProps, {})(Chrome);

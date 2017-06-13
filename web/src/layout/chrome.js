import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';

import isRegisteredUser from '../reducers/is-registered-user.js';
import logo from '../chrome/assets/logo-inverted.svg';

const navBgColor = '#29526d';
const navFgColorActive = '#ffffff';
const navFgColorInactive = '#7591a1';
const navBarColorActive = '#3fbcd5';

const NavLink = withRouter(({ to, className, text, router }) => (
  <Link to={to}>
    <div
      className={`${className} center inline-block`}
      style={{
        background: navBgColor,
        borderBottomWidth: '0.2rem',
        borderBottomStyle: 'solid',
        borderBottomColor: router.isActive(to) ? navBarColorActive : '#ffffff',
        color: router.isActive(to) ? navFgColorActive : navFgColorInactive
      }}
    >
      {text}
    </div>
  </Link>
));

const imageHeight = '4rem';

const Chrome = ({ title: _title, storeCode, children, showNav }) => (
  <div className="col-12">
    <div className="fixed top-0 right-0 left-0 bg-navy border-silver white z1">
      <header>
        <div className="mx-auto">
          <div className="mx4 mt3">
            <img
              src={logo}
              alt="honesty.store"
              style={{ maxHeight: imageHeight, minHeight: imageHeight }}
            />
          </div>

          <h3 className="my2 center regular">
            {storeCode || '\u00a0'}
          </h3>
        </div>
      </header>

      {showNav &&
        <nav>
          <div className="col-12">
            <NavLink className="py2 col-4" to="/store" text="Store" />
            <NavLink className="py2 col-4" to="/profile" text="Profile" />
            <NavLink className="py2 col-4" to="/help" text="Support" />
          </div>
        </nav>}
    </div>

    <section
      style={{
        paddingTop: showNav ? '13.6rem' : '10rem'
      }}
    >
      {children}
    </section>
  </div>
);

const mapStateToProps = ({ user, store: { code: storeCode } }) => ({
  storeCode,
  showNav: isRegisteredUser(user)
});

export default connect(mapStateToProps, {})(Chrome);

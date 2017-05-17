import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { NotNow } from '../chrome/link';
import { performLogout } from '../actions/logout.js';
import Full from '../layout/full';

export const Logout = ({ performLogout }) => (
  <Full left={<NotNow />}>
    <h1>Want to log out?</h1>
    <p>You can always login again using your email address.</p>
    <p>
      <Link className="btn btn-primary btn-big" onClick={performLogout}>
        Log Out
      </Link>
    </p>
  </Full>
);

const mapStateToProps = () => ({});

const mapDispatchToProps = { performLogout };

export default connect(mapStateToProps, mapDispatchToProps)(Logout);

import React from 'react';
import { connect } from 'react-redux';
import { NotNow } from '../chrome/link';
import Button from '../chrome/button';
import Page from '../chrome/page';
import { performLogout } from '../actions/logout.js';

export const Logout = ({ performLogout }) =>
  <Page left={<NotNow />}
    title="Log Out"
    invert={true}
    nav={false}>
    <div>
      <h1>Want to log out?</h1>
      <p>You can always login again using your email address.</p>
      <p><Button onClick={performLogout} type="danger">Log Out</Button></p>
    </div>
  </Page>;

const mapStateToProps = () => ({});

const mapDispatchToProps = { performLogout };

export default connect(mapStateToProps, mapDispatchToProps)(Logout);

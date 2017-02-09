import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { MUTED_TEXT, DANGER, LIGHT_BACKGROUND } from '../chrome/colors';
import Page from '../chrome/page';
import Balance from '../topup/balance';
import './index.css';

const Profile = ({ emailAddress, balance }) => (
  <Page title="Profile"
    right={<Balance balance={balance} />}>
    <div>
      <div className="profile-badge" style={{ borderColor: MUTED_TEXT, background: LIGHT_BACKGROUND }}>
        <div className="profile-badge-details">
          <div className="profile-badge-details-email">
            <h3>Email</h3>
            {emailAddress}
          </div>
        </div>
        <div className="profile-badge-action">
          <Link to={`/profile/edit`}>Edit</Link>
        </div>
      </div>
      <ul className="profile-actions" style={{ borderColor: MUTED_TEXT, color: DANGER, background: LIGHT_BACKGROUND }}>
        <li style={{ borderColor: MUTED_TEXT }}><Link to={`/profile/logout`}>Log Out</Link></li>
        <li style={{ borderColor: MUTED_TEXT }}><Link to={`/profile/close`}>Close Account</Link></li>
      </ul>
    </div>
  </Page>
);


const mapStateToProps = ({ user: { emailAddress, balance } }) => ({
  emailAddress,
  balance: balance || 0
});

export default connect(mapStateToProps)(Profile);
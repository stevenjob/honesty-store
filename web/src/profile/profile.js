import React from 'react';
import { BRAND_LIGHT, LIGHT_TEXT, MUTED_TEXT, DANGER } from '../chrome/colors';
import './profile.css';

export default ({ children }) => (
  <div>
    <div className="profile-badge" style={{ borderColor: MUTED_TEXT }}>
      <div className="profile-badge-image" style={{ background: BRAND_LIGHT, color: LIGHT_TEXT }}>HJ</div>
      <div className="profile-badge-details">
        <div className="profile-badge-details-name">Honest Jo</div>
        <div className="profile-badge-details-email">honesty-jo@example.com</div>
      </div>
      <div className="profile-badge-action">
        <a href={location.hash}>Edit</a>
      </div>
    </div>
    <ul className="profile-info" style={{ borderColor: MUTED_TEXT, color: BRAND_LIGHT }}>
      <li style={{ borderColor: MUTED_TEXT }}><a href={location.hash}>About honesty.store</a></li>
      <li style={{ borderColor: MUTED_TEXT }}><a href={location.hash}>Terms &amp; Conditions</a></li>
      <li style={{ borderColor: MUTED_TEXT }}><a href={location.hash}>Privacy Policy</a></li>
      <li style={{ borderColor: MUTED_TEXT }}><a href={location.hash}>App Version</a></li>
    </ul>
    <ul className="profile-actions" style={{ borderColor: MUTED_TEXT, color: DANGER }}>
      <li style={{ borderColor: MUTED_TEXT }}><a href={location.hash}>Log Out</a></li>
      <li style={{ borderColor: MUTED_TEXT }}><a href={location.hash}>Close Account</a></li>
    </ul>
  </div>
);

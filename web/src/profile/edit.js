import React from 'react';
import { Link } from 'react-router';
import { NotNow } from '../chrome/link';
import Full from '../layout/full';

export default () => (
  <Full left={<NotNow />}>
    <h1>Want to update your profile?</h1>
    <p>
      If you want to report a change of email address or update any of your
      personal information please chat with customer support.
    </p>
    <p>
      <Link className="btn btn-primary" to={`/help`}>
        Chat to Customer Support
      </Link>
    </p>
  </Full>
);

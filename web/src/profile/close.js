import React from 'react';
import { Link } from 'react-router';
import { NotNow } from '../chrome/link';
import Full from '../layout/full';

export default () => (
  <Full left={<NotNow />}>
    <h1>Want to close your account?</h1>
    <p>
      If you want to close your account and receive a refund of your remaining
      balance please chat with customer support.
    </p>
    <p>
      <Link className="btn btn-primary" to={`/help`}>
        Chat to Customer Support
      </Link>
    </p>
  </Full>
);

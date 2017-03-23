import React from 'react';
import { Link } from 'react-router';
import Full from '../layout/full';
import { Back } from '../chrome/link';

export default () =>
  <Full top={<Back />}>
    <h1>Thanks for contributing to your store!</h1>
    <p>Your request is awaiting approval, we'll notify you when it is listed.</p>
    <Link to="/store" className="btn btn-primary btn-big">Back to My Store</Link>
  </Full>;

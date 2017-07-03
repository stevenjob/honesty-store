import React from 'react';
import { Link } from 'react-router';
import Full from '../layout/full';
import { BackToPage } from '../chrome/link';

export default () => (
  <Full left={<BackToPage path="/store" />}>
    <h1>Victory!</h1>
    <p>
      You've fought valiantly on behalf of your favourite snacks and they are
      all humbled to have earnt your respect.
    </p>
    <p>Your decisiveness in this battle will go down in history<sup>*</sup>.</p>
    <Link to="/store" className="btn btn-primary btn-big">
      Back to My Store
    </Link>
    <p className="mt4 h6">
      <sup>*</sup>
      Thanks! We've recorded your answers and we'll use them to help shape the
      future contents of your store...
    </p>
  </Full>
);

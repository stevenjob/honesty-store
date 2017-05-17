import React from 'react';
import { Success } from '../layout/alert';
import history from '../history';

export default () => (
  <Success
    title="Thanks for contributing to your store!"
    subtitle="Your request is awaiting approval, we'll notify you when it is listed."
    onClick={() => history.replace(`/store`)}
  />
);

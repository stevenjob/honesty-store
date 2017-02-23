import React from 'react';
import history from '../history';
import { Success } from '../layout/alert';

export default () =>
  <Success title="Please follow the link in the email to confirm your subscription"
    subtitle="Thanks for registering your interest!"
    onClick={() => history.replace(`/`)} />;

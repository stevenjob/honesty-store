import React from 'react';
import { browserHistory } from 'react-router';
import { Success } from '../chrome/modal';

export default () =>
  <Success title="Please follow the link in the email to confirm your subscription"
    subtitle="Thanks for registering your interest!"
    onClick={() => browserHistory.replace(`/`)} />;

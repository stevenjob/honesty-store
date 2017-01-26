import React from 'react';
import { browserHistory } from 'react-router';
import { Success } from '../chrome/modal';

export default () =>
    <Success title="Please follow the link in the email to continue"
        subtitle="A magic link was sent to your email address"/>;

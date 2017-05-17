import React from 'react';
import { Success } from '../layout/alert';
import history from '../history';

export default () => (
  <Success
    title="Thank you for signing up!"
    image={require('../chrome/assets/success.svg')}
    onClick={() => history.replace(`/store`)}
  />
);

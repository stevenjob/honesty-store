import React from 'react';
import { Success } from '../layout/alert';
import history from '../history';

export default () => (
  <Success
    title="We've processed your refund!"
    image={require('../chrome/assets/success.svg')}
    onClick={() => history.replace(`/history`)}
  />
);

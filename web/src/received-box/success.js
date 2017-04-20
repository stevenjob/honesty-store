import React from 'react';
import history from '../history';
import { Success } from '../layout/alert';

export default () => <Success title="The items will appear in the store shortly, but feel free to put the box out right-away"
  subtitle="Hooray, your box has arrived!"
  onClick={() => history.replace(`/store`)} />;

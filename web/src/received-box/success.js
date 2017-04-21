import React from 'react';
import history from '../history';
import { Success } from '../layout/alert';

export default () => <Success title="The items should now be available in your store"
  subtitle="Hooray, your box has arrived!"
  onClick={() => history.replace(`/store`)} />;

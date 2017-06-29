import React from 'react';
import history from '../history';
import { Success } from '../layout/alert';

export const NewCardSuccess = () => (
  <Success
    title={
      <span>Your card has been added and will be used for future charges</span>
    }
    subtitle="Thank you for your card update!"
    onClick={() => history.replace(`/history`)}
  />
);

export default NewCardSuccess;

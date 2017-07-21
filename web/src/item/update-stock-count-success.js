import React from 'react';
import history from '../history';
import { Success } from '../layout/alert';

export default ({ params: { itemId } }) => (
  <Success
    title="We've updated the stock count"
    subtitle="Thanks for the report!"
    onClick={() => history.replace(`/item/${itemId}`)}
  />
);

import React from 'react';
import history from '../../history';
import { Success } from '../../layout/alert';

export default ({ params: { itemId } }) => (
  <Success
    title="Item details successfully stored"
    onClick={() => history.replace(`/admin/item`)}
  />
);

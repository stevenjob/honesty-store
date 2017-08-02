import React from 'react';
import history from '../../history';
import { Success } from '../../layout/alert';

export default ({ params: { itemId, code } }) => (
  <Success
    title="Item details successfully stored"
    onClick={() => history.replace(code ? `/admin/listing/${code}` : `/admin/item`)}
  />
);

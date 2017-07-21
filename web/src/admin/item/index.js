import React from 'react';
import Full from '../../layout/full';
import ItemList from './item-list';

export default () => (
  <Full>
    <ItemList pathPrefix="/admin/item" />
  </Full>
);

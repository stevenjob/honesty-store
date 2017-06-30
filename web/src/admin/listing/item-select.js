import React from 'react';
import { BackToPage } from '../../chrome/link';
import Full from '../../layout/full';
import ItemList from '../item/item-list';

export default ({ items, params: { code } }) => (
  <Full left={<BackToPage path={`/admin/listing/${code}`} title="Listings" />}>
    <p>Select an item to list</p>
    <ItemList pathPrefix={`/admin/listing/${code}/item`} />
  </Full>
);

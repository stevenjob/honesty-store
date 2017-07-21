import React from 'react';
import { Link } from 'react-router';
import { BackToPage } from '../../chrome/link';
import Full from '../../layout/full';
import ItemList from '../item/item-list';

export default ({ items, params: { code } }) => (
  <Full left={<BackToPage path={`/admin/listing/${code}`} title="Listings" />}>
    <Link
      className="btn btn-primary col-right"
      to={`/admin/listing/${code}/item/new`}
    >
      New item
    </Link>
    <p className="clearfix">Select an item to list</p>
    <ItemList pathPrefix={`/admin/listing/${code}/item`} />
  </Full>
);

import React from 'react';
import { Link } from 'react-router';
import Full from '../../layout/full';
import ItemList from './item-list';

export default () => (
  <Full>
    <div className="clearfix mb2">
      <Link
        className="btn btn-primary inline-block sm-col-right"
        to="/admin/item/new"
      >
        Add new
      </Link>
    </div>
    <ItemList pathPrefix="/admin/item" />
  </Full>
);

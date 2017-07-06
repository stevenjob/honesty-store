import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Chrome from '../layout/chrome';
import List from '../chrome/list';
import ItemListing from './item-listing';

const More = ({ items }) =>
  <Chrome>
    <div className="center bg-white border-bottom border-silver p2">
      <Link to="/more/list/new">+ Add a new item</Link>
    </div>
    <List data={items} itemRenderer={item => <ItemListing item={item} />}/>
  </Chrome>;

const mapStateToProps = ({ user: { id: userId }, store: { items } }) => ({
  items: items.filter(({ sellerId }) => sellerId === userId)
});

export default connect(mapStateToProps)(More);

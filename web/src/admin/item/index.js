import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import List from '../../chrome/list';
import Full from '../../layout/full';

const AdminItemList = ({ items }) => {
  const itemRenderer = ({ id, name, qualifier, image }) => (
    <Link to={`/admin/item/${id}`}>
      <div className="px2 py1 regular navy col-12 left-align">
        <p>{name} {qualifier && qualifier}</p>
      </div>
    </Link>
  );

  return (
    <Full>
      <div className="clearfix mb2">
        <Link
          className="btn btn-primary inline-block sm-col-right"
          to="/admin/item/new"
        >
          Add new
        </Link>
      </div>
      <List data={items} itemRenderer={itemRenderer} />
    </Full>
  );
};

const mapStateToProps = ({ admin }, { params: { id } }) => {
  const items = (admin.items || [])
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    items
  };
};

export default connect(mapStateToProps)(AdminItemList);

import React from 'react';
import { connect } from 'react-redux';
import List from '../../chrome/list';
import { Link } from 'react-router';

const ItemList = ({ pathPrefix, items }) => {
  const itemRenderer = ({ id, name, qualifier, image }) => (
    <Link to={`${pathPrefix}/${id}`}>
      <div className="px2 py1 regular navy col-12 left-align">
        <p>{name} {qualifier && qualifier}</p>
      </div>
    </Link>
  );
  return <List data={items} itemRenderer={itemRenderer} />;
};

const mapStateToProps = ({ admin }) => {
  const items = (admin.items || [])
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    items
  };
};

export default connect(mapStateToProps)(ItemList);

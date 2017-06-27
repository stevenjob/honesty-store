import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import List from '../../chrome/list';
import Full from '../../layout/full';

const MarketplaceCategoryList = ({ items }) => {
  const itemRenderer = ({ id, name, qualifier, image }) => (
    <Link to={`/admin/item/${id}`}>
      <div className="px2 py1 regular navy col-12 left-align">
        <p>{name} {qualifier && qualifier}</p>
      </div>
    </Link>
  );

  return (
    <Full>
      <List data={items} itemRenderer={itemRenderer} />
    </Full>
  );
};

const mapStateToProps = ({ admin }, { params: { id } }) => {
  const items = (admin.items || []).sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  });
  return {
    items
  };
};

export default connect(mapStateToProps)(MarketplaceCategoryList);

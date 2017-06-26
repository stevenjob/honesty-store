import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import List from '../../chrome/list';
import { Back } from '../../chrome/link';
import Chrome from '../../layout/chrome';

const MarketplaceCategoryList = ({ items }) => {
  const itemRenderer = ({ id, name, qualifier, image }) => (
    <Link to={`/admin/item/${id}`}>
      <div className="px2 py1 regular navy col-12">
        <p>{name} {qualifier && qualifier}</p>
      </div>
    </Link>
  );

  return (
    <Chrome left={<Back />} title="All Items">
      <List data={items} itemRenderer={itemRenderer} />
    </Chrome>
  );
};

const mapStateToProps = ({ marketplace }, { params: { id } }) => {
  const items = (marketplace.items || []).sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  });
  return {
    items
  };
};

export default connect(mapStateToProps)(MarketplaceCategoryList);

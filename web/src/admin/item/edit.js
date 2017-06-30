import React from 'react';
import { connect } from 'react-redux';
import { performUpdateItem } from '../../actions/update-item';
import { BackToPage } from '../../chrome/link';
import ItemDetails from './details';

const AdminItemEdit = ({ performUpdateItem, item }) => {
  return (
    <ItemDetails
      onSubmit={details => performUpdateItem({ id: item.id, details })}
      item={item}
      left={<BackToPage path="/admin/item" title="Items" />}
    />
  );
};

const mapStateToProps = ({ admin }, { params: { itemId } }) => {
  const items = admin.items || [];
  const item = itemId ? items.find(({ id }) => id === itemId) : {};
  return {
    item
  };
};

export default connect(mapStateToProps, { performUpdateItem })(AdminItemEdit);

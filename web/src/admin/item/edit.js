import React from 'react';
import { connect } from 'react-redux';
import ItemDetails from './details';
import { performUpdateItem } from '../../actions/update-item';

const AdminItemEdit = ({ performUpdateItem, params: { itemId } }) => {
  return (
    <ItemDetails
      onSubmit={details => performUpdateItem({ id: itemId, details })}
      itemId={itemId}
    />
  );
};

export default connect(props => props, { performUpdateItem })(AdminItemEdit);

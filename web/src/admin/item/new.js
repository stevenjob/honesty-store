import React from 'react';
import { connect } from 'react-redux';
import { BackToPage } from '../../chrome/link';
import { performCreateItem } from '../../actions/create-item';
import ItemDetails from './details';

const AdminItemNew = ({ performCreateItem, params }) => (
  <ItemDetails
    onSubmit={details => performCreateItem({ details })}
    left={<BackToPage path="/admin/item" title="Listings" />}
  />
);

export default connect(props => props, { performCreateItem })(AdminItemNew);

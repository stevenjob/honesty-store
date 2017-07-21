import React from 'react';
import { connect } from 'react-redux';
import { BackToPage } from '../../chrome/link';
import { performCreateItem } from '../../actions/create-item';
import ItemDetails from './details';

const AdminItemNew = ({ performCreateItem, params: { code: storeCode } }) => (
  <ItemDetails
    onSubmit={details => performCreateItem({ details, storeCode })}
    left={<BackToPage path={`/admin/listing/${storeCode}`} title="Listings" />}
  />
);

export default connect(props => props, { performCreateItem })(AdminItemNew);

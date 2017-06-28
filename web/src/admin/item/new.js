import React from 'react';
import { connect } from 'react-redux';
import ItemDetails from './details';
import { performCreateItem } from '../../actions/create-item';

const AdminItemNew = ({ performCreateItem, params }) => (
  <ItemDetails onSubmit={details => performCreateItem({ details })} />
);

export default connect(props => props, { performCreateItem })(AdminItemNew);

import React from 'react';
import history from '../history';
import { connect } from 'react-redux';
import { Success } from '../layout/alert';
import safeLookupItemImage from './safeLookupItemImage';

export const ItemPurchaseSuccess = ({ item: { id, image }, quantity }) => (
  <Success
    title="Enjoy!"
    subtitle="Thank you for your honesty!"
    image={safeLookupItemImage(image)}
    onClick={() => history.replace(`/item/${id}`)}
  />
);

const mapStateToProps = (
  { store: { items = [] } },
  { params: { itemId, quantity } }
) => {
  const item = items.find(item => item.id === itemId);
  return {
    item: item || {},
    quantity
  };
};

export default connect(mapStateToProps)(ItemPurchaseSuccess);

import React from 'react';
import history from '../history';
import { connect } from 'react-redux';
import { Success } from '../chrome/modal';
import safeLookupItemImage from './safeLookupItemImage';

export const ItemPurchaseSuccess = ({ item: { name, image } }) =>
  <Success title={`Enjoy your ${name}!`}
    subtitle="Thank you for your honesty!"
    image={safeLookupItemImage(image)}
    onClick={() => history.replace(`/history`)}
  />;

const mapStateToProps = (
  { store: { items = []} },
  { params: { itemId } }
) => {
  const item = items.find(item => item.id === itemId);
  return {
    item: item || {}
  };
};

export default connect(mapStateToProps)(ItemPurchaseSuccess);

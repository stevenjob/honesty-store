import React from 'react';
import history from '../history';
import { connect } from 'react-redux';
import { Success } from '../layout/alert';
import safeLookupItemImage from './safeLookupItemImage';

export const ItemPurchaseSuccess = ({ item: { image, genericName } }) =>
  <Success title={`Enjoy your ${genericName}!`}
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

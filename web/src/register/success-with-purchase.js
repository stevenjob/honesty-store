import React from 'react';
import history from '../history';
import { connect } from 'react-redux';
import { Success } from '../layout/alert';
import safeLookupItemImage from '../item/safeLookupItemImage';

export const RegisterSuccessWithPurchase = ({ item: { name, image } }) =>
  <Success title={`Enjoy your ${name}!`}
    subtitle="Thank you for signing up!"
    image={safeLookupItemImage(image)}
    onClick={() => history.replace(`/store`)}
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

export default connect(mapStateToProps)(RegisterSuccessWithPurchase);

import React from 'react';
import history from '../history';
import { connect } from 'react-redux';
import { Success } from '../chrome/modal';
import safeLookupItemImage from '../item/safeLookupItemImage';

export const RegisterSuccessWithPurchase = ({ item: { name, image }, loading }) =>
  <Success title={`Enjoy your ${name}!`}
    subtitle="Thank you for signing up!"
    image={safeLookupItemImage(image)}
    onClick={() => history.replace(`/history`)}
    loading={loading}
  />;

const mapStateToProps = (
  { store: { items = []}, pending },
  { params: { itemId } }
) => {
  const item = items.find(item => item.id === itemId);
  return {
    item: item || {},
    loading: pending.length > 0
  };
};

export default connect(mapStateToProps)(RegisterSuccessWithPurchase);

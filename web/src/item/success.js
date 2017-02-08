import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Success } from '../chrome/modal';

export const ItemPurchaseSuccess = ({ item: { name, image }, loading }) =>
  <Success title={`Enjoy your ${name}!`}
    subtitle="Thank you for your honesty!"
    image={image}
    onClick={() => browserHistory.replace(`/history`)}
    loading={loading} />;

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

export default connect(mapStateToProps)(ItemPurchaseSuccess);

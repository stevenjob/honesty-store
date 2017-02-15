import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Success } from '../chrome/modal';

export const RegisterSuccessWithoutPurchase = ({ loading }) =>
  <Success title="Thank you for signing up!"
    image={require('../chrome/assets/success.svg')}
    onClick={() => browserHistory.replace(`/history`)}
    loading={loading}
  />;

const mapStateToProps = (
  { pending },
  { params: { itemId } }
) => {
  return { loading: pending.length > 0 };
};

export default connect(mapStateToProps)(RegisterSuccessWithoutPurchase);

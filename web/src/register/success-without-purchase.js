import React from 'react';
import { connect } from 'react-redux';
import { Success } from '../chrome/modal';
import history from '../history';

export const RegisterSuccessWithoutPurchase = ({ loading }) =>
  <Success title="Thank you for signing up!"
    image={require('../chrome/assets/success.svg')}
    onClick={() => history.replace(`/history`)}
    loading={loading}
  />;

const mapStateToProps = (
  { pending },
  { params: { itemId } }
) => ({
  loading: pending.length > 0
});

export default connect(mapStateToProps)(RegisterSuccessWithoutPurchase);

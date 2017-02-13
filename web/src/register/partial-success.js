import React from 'react';
import history from '../history';
import { connect } from 'react-redux';
import { Success } from '../chrome/modal';
import Currency from '../format/Currency';

export const RegisterPartialSuccess = ({balance, params: { itemId } }) =>
  <Success
    title={
      <span>
        Your top up succeeded but we had trouble recording your purchase, please try again from the store screen. Your balance is now <Currency amount={balance} />
      </span>
    }
    subtitle="Thank you for signing up!"
    onClick={() => history.replace(`/item/${itemId}`)}
    />;

const mapStateToProps = ({ user: { balance = 0 } }) => ({
  balance
});

export default connect(mapStateToProps)(RegisterPartialSuccess);

import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Success } from '../chrome/modal';
import currency from '../format/currency';

export const RegisterPartialSuccess = ({balance, params: { storeId, itemId } }) =>
    <Success title={`Your top up succeeded but we had trouble recording your purchase, please try again from the store screen. Your balance is now £${currency(balance)}`}
        subtitle="Thank you for signing up!"
        onClick={() => browserHistory.replace(`/${storeId}/item/${itemId}`)}/>;

const mapStateToProps = ({ user: { balance = 0 } }) => ({
    balance
});

export default connect(mapStateToProps)(RegisterPartialSuccess);
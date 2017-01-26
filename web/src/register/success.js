import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Success } from '../chrome/modal';
import currency from '../format/currency';

export const RegisterSuccess = ({balance }) =>
    <Success title={`Your balance is now £${currency(balance)}`}
        subtitle="Thank you for signing up!"
        onClick={() => browserHistory.replace(`/history`)}/>;

const mapStateToProps = ({ user: { balance = 0 } }) => ({
    balance
});

export default connect(mapStateToProps)(RegisterSuccess);
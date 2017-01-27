import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Success } from '../chrome/modal';
import Currency from '../format/Currency';

export const RegisterSuccess = ({balance }) =>
    <Success title={<span>Your balance is now <Currency amount={balance}/></span>}
        subtitle="Thank you for signing up!"
        onClick={() => browserHistory.replace(`/history`)}/>;

const mapStateToProps = ({ user: { balance = 0 } }) => ({
    balance
});

export default connect(mapStateToProps)(RegisterSuccess);

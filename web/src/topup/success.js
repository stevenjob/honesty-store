import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { Success } from '../chrome/modal';
import currency from '../format/currency';

export const TopupSuccess = ({ balance }) =>
    <Success title={`Your balance is now £${currency(balance)}`}
        subtitle="Thank you for your top up!"
        onClick={() => browserHistory.replace(`/history`)}/>;

const mapStateToProps = ({ user: { balance = 0 } }) => ({
    balance
});

export default connect(mapStateToProps)(TopupSuccess);
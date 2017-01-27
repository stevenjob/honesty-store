import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { Success } from '../chrome/modal';
import Currency from '../format/Currency';

export const TopupSuccess = ({ balance }) =>
    <Success title={<span>Your balance is now <Currency amount={balance} /></span>}
        subtitle="Thank you for your top up!"
        onClick={() => browserHistory.replace(`/history`)}/>;

const mapStateToProps = ({ user: { balance = 0 } }) => ({
    balance
});

export default connect(mapStateToProps)(TopupSuccess);

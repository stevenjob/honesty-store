import React from 'react';
import { connect } from 'react-redux';
import history from '../history';
import { Success } from '../layout/alert';
import Currency from '../format/Currency';
import { determinePrepay } from '../balance/prepay';

export const TopupSuccess = ({ balance, isPrepay }) => (
  <Success
    title={<span>Your balance is now <Currency amount={balance} /></span>}
    subtitle={
      isPrepay
        ? 'Thank you for your top up!'
        : 'Thank you for updating your card!'
    }
    onClick={() => history.replace(`/profile/history`)}
  />
);

const mapStateToProps = ({ user: { balance = 0, creditLimit } }) => ({
  isPrepay: determinePrepay(creditLimit),
  balance
});

export default connect(mapStateToProps)(TopupSuccess);

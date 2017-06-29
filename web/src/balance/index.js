import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Card from '../topup/card';
import Full from '../layout/full';
import { Close } from '../chrome/link';

const Balance = ({ balance, cardDetails }) => (
  <Full left={<Close to={`/store`} />}>
    <h1>Your active card is</h1>
    <div className="">
      <Card {...cardDetails} />
      <p>
        <Link to={`/balance/new-card`}>Add a different card</Link>
      </p>
    </div>
  </Full>
);

const mapStateToProps = ({ user: { balance, cardDetails } }) => ({
  balance,
  cardDetails
});

export default connect(mapStateToProps)(Balance);

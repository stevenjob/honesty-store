import React from 'react';
import { connect } from 'react-redux';
import Card from '../chrome/card';
import { Back } from '../chrome/link';
import Full from '../layout/full';
import { performTopupWithNewCard } from '../actions/topup';

const NewCard = ({ performTopupWithNewCard, ...rest }) => {
  return (
    <Full top={<Back></Back>}>
    <Card
      isInitialTopUp={false}
      confirmButtonText="Update Card & Top Up £5"
      onSubmit={({ topUpAmount, cardDetails }) => performTopupWithNewCard({ topUpAmount, cardDetails })}
      {...rest}
    />
    </Full>
  );
};

export default connect(() => ({}), ({ performTopupWithNewCard }))(NewCard);

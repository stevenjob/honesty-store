import React from 'react';
import { connect } from 'react-redux';
import Card from '../chrome/card';
import { Back } from '../chrome/link';
import Full from '../layout/full';
import { performTopup } from '../actions/topup';

const NewCard = ({ performTopup, ...rest }) => {
  return (
    <Full left={<Back />}>
      <Card
        isInitialTopUp={false}
        confirmButtonText="Update Card & Top Up £5"
        onSubmit={({ topUpAmount: amount, cardDetails }) =>
          performTopup({ amount, cardDetails })}
        {...rest}
      />
    </Full>
  );
};

export default connect(() => ({}), { performTopup })(NewCard);

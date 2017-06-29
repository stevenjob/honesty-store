import React from 'react';
import { connect } from 'react-redux';
import Card from '../chrome/card';
import { Back } from '../chrome/link';
import Full from '../layout/full';
import { performNewCard } from '../actions/new-card';

const NewCard = ({ performNewCard, ...rest }) => (
  <Full left={<Back />}>
    <Card
      isInitialTopUp={false}
      confirmButtonText="Add New Card"
      onSubmit={({ cardDetails }) => performNewCard({ cardDetails })}
      {...rest}
    />
  </Full>
);

export default connect(() => ({}), { performNewCard })(NewCard);

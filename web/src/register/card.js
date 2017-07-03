import React from 'react';
import { connect } from 'react-redux';
import Card from '../chrome/card';
import { BackToPage } from '../chrome/link';
import Full from '../layout/full';
import { performRegister2 } from '../actions/register2';

const RegisterCard = ({
  params: { itemId, emailAddress },
  performRegister2,
  ...others
}) => {
  const completeUserRegistration = ({ topUpAmount, cardDetails }) => {
    performRegister2({
      itemID: itemId,
      topUpAmount: topUpAmount,
      emailAddress,
      cardDetails
    });
  };

  const topUpText = 'Confirm £5 Top Up';
  return (
    <Full left={<BackToPage path={`/item/${itemId}`}>Register</BackToPage>}>
      <Card
        isInitialTopUp={true}
        confirmButtonText={itemId ? `${topUpText} & Pay` : topUpText}
        onSubmit={completeUserRegistration}
        {...others}
      />
    </Full>
  );
};

export default connect(() => ({}), { performRegister2 })(RegisterCard);

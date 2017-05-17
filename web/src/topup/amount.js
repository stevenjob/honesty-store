import React from 'react';
import { connect } from 'react-redux';
import history from '../history';
import Stepper from '../chrome/stepper';
import { Close } from '../chrome/link';
import Currency from '../format/Currency';
import Full from '../layout/full';

const Amount = ({ balance }) => {
  return (
    <Full left={<Close to={`/store`} />}>
      <h1>Your balance is currently</h1>
      <h1 className="aqua"><Currency amount={balance} /></h1>
      <Stepper
        label="How much would you like to top up?"
        onIncrement={amount => amount}
        incrementDisabled={() => true}
        onDecrement={amount => amount}
        decrementDisabled={() => true}
        formatDescription={amount => (
          <span>
            Your balance will be <Currency amount={balance + amount} />
          </span>
        )}
        formatValue={amount => <Currency amount={amount} />}
        formatButton={amount => ({
          text: 'Top Up using a Card',
          disabled: false
        })}
        initialValue={500}
        onClick={amount => {
          history.push(`/topup/${amount}`);
        }}
      />
    </Full>
  );
};

const mapStateToProps = ({ user: { balance = 0 } }) => ({
  balance
});

export default connect(mapStateToProps)(Amount);

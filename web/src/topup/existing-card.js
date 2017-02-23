import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { performTopup } from '../actions/topup';
import { Back } from '../chrome/link';
import Currency from '../format/Currency';
import Card from './card';
import Full from '../layout/full';


const TopupCard = ({ cardDetails, amount, performTopup }) => {
  return <div>
    <p>Please check this is the card you want to top up <Currency amount={amount} /> from</p>
    <div className="">
      <Card {...cardDetails} />
      <p>
        <Link to={`/topup/${amount}/new`}>Add a different card</Link>
      </p>
    </div>
    <p className="">
      <Link className="btn btn-primary" onClick={() => performTopup({ amount })}>Confirm <Currency amount={amount} /> Top Up</Link>
    </p>
  </div>;
};

const NewCard = ({ amount }) =>
  <div className="">
    <h4>No card details to top up <Currency amount={amount} /> from - please add a new card</h4>
    <p>
      <Link to={`/topup/${amount}/new`}>Add a new card</Link>
    </p>
    <p className="">
      <Link className="btn btn-primary">Confirm <Currency amount={amount} /> Top Up</Link>
    </p>
  </div>;

const TopupPrompt = ({ amount, cardDetails, performTopup }) =>
  <Full top={<Back>Balance</Back>}>
    {
      cardDetails
        ? <TopupCard cardDetails={cardDetails} amount={amount} performTopup={performTopup} />
        : <NewCard amount={amount} />
    }
  </Full>;

const mapStateToProps = ({
  user: {
    balance = 0,
    cardDetails // maybe undefined
  },
}) => ({
  balance,
  cardDetails
});

const mapDispatchToProps = { performTopup };

const mergeProps = (stateProps, dispatchProps, { params: { amount }}) => ({
  ...stateProps,
  ...dispatchProps,
  amount: Number(amount)
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(TopupPrompt);

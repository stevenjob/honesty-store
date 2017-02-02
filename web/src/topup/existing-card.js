import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { performTopup } from '../actions/topup';
import { BRAND_LIGHT, MUTED_TEXT, LIGHT_TEXT } from '../chrome/colors';
import Button from '../chrome/button';
import Page from '../chrome/page';
import { Back } from '../chrome/link';
import Currency from '../format/Currency';
import './existing-card.css';

const zeroPadMonth = (month) => {
  const prefix = month < 10 ? '0' : '';
  return `${prefix}${month}`;
};

export const ExisitingCard = ({ amount, brand, digits, expiry, performTopup }) =>
  <Page left={<Back>Balance</Back>}
    title={`Top Up`}
    invert={true}
    nav={false}
    fullscreen={true}>
    <div className="topup-existing-card">
      <h4>Please check this is the card you want to top up <Currency amount={amount} /> from</h4>
      <div className="topup-existing-card-container">
        <div className="topup-existing-card-image">
          <div className="topup-existing-card-image-background" />
          <div className={`topup-existing-card-image-${brand}`} />
          <p className="topup-existing-card-image-number" style={{ color: MUTED_TEXT }}>
            <span>****</span>
            <span>****</span>
            <span>****</span>
            <span style={{ color: LIGHT_TEXT }}>{digits}</span>
          </p>
          <p className="topup-existing-card-image-expiry" style={{ color: LIGHT_TEXT }}>{expiry}</p>
        </div>
        <p>
          <Link to={`/topup/${amount}/new`} style={{ color: BRAND_LIGHT }}>Add a different card</Link>
        </p>
      </div>
      <p className="topup-existing-card-topup">
        <Button onClick={() => performTopup({ amount })}>Confirm <Currency amount={amount} /> Top Up</Button>
      </p>
    </div>
  </Page>;

const mapStateToProps = ({
  user: {
    balance = 0,
    cardDetails: { brand, expMonth, expYear, last4 },
  },
}) => ({
  balance,
  brand: brand.toLowerCase(),
  digits: last4,
  expiry: `${zeroPadMonth(expMonth)}/${expYear % 100}`,
});

const mapDispatchToProps = { performTopup };

const mergeProps = (stateProps, dispatchProps, { params: { amount }}) => ({
  ...stateProps,
  ...dispatchProps,
  amount: Number(amount)
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ExisitingCard);

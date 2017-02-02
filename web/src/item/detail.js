import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { Back } from '../chrome/link';
import Page from '../chrome/page';
import Stepper from '../chrome/stepper';
import Button from '../chrome/button';
import Currency from '../format/Currency';
import { performPurchase } from '../actions/purchase';
import isRegistered from '../reducers/is-registered-user';
import './detail.css';

const minNumItems = 1;

const ItemDetail = ({
  item: { id, name, price, image },
  loading,
  balance,
  performPurchase,
  registered
}) => {
  const calculateBalanceRemaining = (numItems) => balance - (price * numItems);

  const decrementNumItems = (numItems) => Math.max(minNumItems, numItems - 1);

  const formatBalance = (numItems) => {
    const balance = calculateBalanceRemaining(numItems);
    return (
      <span>
        Your balance will be <Currency amount={balance} />
      </span>
    );
  };

  const formatPurchaseButton = (numItems) => {
    const balance = calculateBalanceRemaining(numItems);
    if (balance < 0) {
      return {
        disabled: true,
        text: `Insufficient funds`
      };
    }
    return {
      disabled: false,
      text: `Pay for ${numItems} ${name}`
    };
  };

  const onClick = (numItems) => {
    const balance = calculateBalanceRemaining(numItems);
    if (balance < 0) {
      browserHistory.push(`/topup`);
    } else {
      performPurchase({ itemId: id, quantity: numItems });
    }
  };

  const PurchaseStepper = <Stepper
    label="How many would you like to pay for?"
    onDecrement={decrementNumItems}
    incrementDisabled={() => false}
    onIncrement={(numItems) => numItems + 1}
    decrementDisabled={(numItems) => numItems <= 1}
    formatDescription={formatBalance}
    formatValue={(numItems) => numItems}
    formatButton={formatPurchaseButton}
    initialValue={1}
    onClick={onClick}
    />;

  const UnregisteredPurchaseButton = <p>
    <Button onClick={() => browserHistory.push(`/register/${id}`)}>
      {`Purchase 1 ${name}`}
    </Button>
  </p>;


  return (
    <Page invert={true}
      fullscreen={true}
      nav={false}
      left={<Back />}>
      {id != null &&
        <div className="item">
          <div className="item-details">
            <h2>{name}<br />{price}<small>p</small></h2>
          </div>
          <div className="item-image" style={{ backgroundImage: `url(${require(`../item/assets/${image}`)})` }} />
          {registered ? PurchaseStepper : UnregisteredPurchaseButton}
        </div>
      }
    </Page>
  );
};

const mapStateToProps = (
  { store: { items = []}, user },
  { params: { itemId } }
) => {
  const item = items.find(el => el.id === itemId);
  const { balance } = user;
  return {
    loading: item == null,
    item: item || {},
    balance,
    registered: isRegistered(user)
  };
};

const mapDispatchToProps = { performPurchase };

export default connect(mapStateToProps, mapDispatchToProps)(ItemDetail);

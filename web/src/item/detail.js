import React from 'react';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import { Back } from '../chrome/link';
import Page from '../chrome/page';
import Stepper from '../chrome/stepper';
import Button from '../chrome/button';
import currency from '../format/currency';
import { performPurchase } from '../actions/purchase';
import isRegistered from '../reducers/is-registered-user';
import './detail.css';

const minNumItems = 1;

const ItemDetail = ({
  storeId,
  item: { id, name, price },
  loading,
  balance,
  performPurchase,
  registered
}) => {
  const calculateBalanceRemaining = (numItems) => balance - (price * numItems);

  const decrementNumItems = (numItems) => Math.max(minNumItems, numItems - 1);

  const formatBalance = (numItems) => {
    const balance = calculateBalanceRemaining(numItems);
    return `Your balance will be £${currency(balance)}`;
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

  const PurchaseStepper = <Stepper
    label="How many would you like to pay for?"
    onDecrement={decrementNumItems}
    onIncrement={(numItems) => numItems + 1}
    formatDescription={formatBalance}
    formatValue={(numItems) => numItems}
    formatButton={formatPurchaseButton}
    initialValue={1}
    onClick={(numItems) => performPurchase({storeId, itemId: id})}
  />;

  const UnregisteredPurchaseButton = <p>
      <Button onClick={() => hashHistory.push(`/${storeId}/register/${id}`)}>
        Purchase 1 {name}
      </Button>
    </p>;


  return (
    <Page
      storeId={storeId}
      invert={true}
      nav={false}
      fullscreen={true}
      left={<Back/>}
      loading={loading}
    >
      <div className="item">
        <div className="item-details">
          <h2>{name}<br/>{price}<small>p</small></h2>
        </div>
        <div className="item-image" style={{ backgroundImage: `url(${require('../store/assets/packet.svg')})` }}/>
        { registered ? PurchaseStepper : UnregisteredPurchaseButton }
      </div>
    </Page>
  );
};

const mapStateToProps = (
  { store: { items = [] }, user },
  { params: { storeId, itemId } }
) => {
  const item = items.find(el => el.id === Number(itemId));
  const { balance } = user;
  return {
    storeId,
    loading: item == null,
    item: item || {},
    balance,
    registered: isRegistered(user)
  };
};

const mapDispatchToProps = { performPurchase };

export default connect(mapStateToProps, mapDispatchToProps)(ItemDetail);

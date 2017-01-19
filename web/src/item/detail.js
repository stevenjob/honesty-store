import React from 'react';
import { connect } from 'react-redux';
import { Back } from '../chrome/link';
import Page from '../chrome/page';
import Stepper from '../chrome/stepper';
import currency from '../format/currency';
import './detail.css';

const minNumItems = 1;

const ItemDetail = ({ 
  storeId,
  item: { id, name, price },
  loading,
  balance
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
        <img src={require('../store/assets/packet.svg')} alt={name}/>
        <Stepper
          label="How many would you like to pay for?"
          onDecrement={decrementNumItems}
          onIncrement={(numItems) => numItems + 1}
          formatDescription={formatBalance}
          formatValue={(numItems) => numItems}
          formatButton={formatPurchaseButton}
          initialValue={1}
          onClick={(numItems) => { /* TODO */ }}
        />
      </div>
    </Page>
  );
};

const mapStateToProps = (
  { store: { items = [] }, user: { balance } },
  { params: { storeId, itemId } }
) => {
  const item = items.find(el => el.id === Number(itemId));
  return {
    storeId,
    loading: item == null,
    item: item || {},
    balance
  };
};

export default connect(mapStateToProps)(ItemDetail);

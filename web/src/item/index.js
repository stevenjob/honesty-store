import React from 'react';
import { connect } from 'react-redux';
import { Back } from '../chrome/link';
import Page from '../chrome/page';
import Stepper from '../chrome/stepper';
import currency from '../format/currency';
import './index.css';

const ItemDetail = ({ 
  storeId,
  item: { id, name, price },
  loading,
  balance
}) => {
  const calculateBalanceRemaining = (numItems) => {
    const balanceRemaining = balance - (price * numItems);
    return balanceRemaining;
  };

  const decrementNumItems = (numItems) => {
    const minNumItems = 1;
    return numItems > minNumItems ? (numItems - 1) : minNumItems;
  };

  const incrementNumItems = (numItems) => {
    const updatedNumItems = numItems + 1;
    const balanceRemaining = calculateBalanceRemaining(updatedNumItems);
    return balanceRemaining >= 0 ? updatedNumItems : numItems; 
  };

  const formatBalance = (numItems) => {
    const balance = calculateBalanceRemaining(numItems);
    return `Your balance will be £${currency(balance)}`;
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
          onIncrement={incrementNumItems}
          formatDescription={formatBalance}
          formatValue={(numItems) => numItems}
          formatButton={(numItems) => `Pay for ${numItems} ${name}`}
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

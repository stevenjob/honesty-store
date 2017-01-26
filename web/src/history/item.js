import React from 'react';
import { connect } from 'react-redux';
import { MUTED_TEXT, BRAND_LIGHT } from '../chrome/colors';
import './item.css';
import currency from '../format/currency';

const AmountLabel = ({ amount, isTopUp }) => {
  if (isTopUp) {
    return <h4 style={{ color: BRAND_LIGHT }}><small>+ £</small>{currency(amount)}</h4>;
  }
  return <h4>{Math.abs(amount)}<small>p</small></h4>;
};

const HistoryItem = ({ isTopUp, text, amount, image }) => {
  const imageRotation = isTopUp ? 0 : -35;
  return (
    <div className="history-item">
      <div
        className="history-item-image"
        style={{
          backgroundImage: `url(${image})`,
          transform: `rotate(${imageRotation}deg)`,
        }}
        alt={text}
      />
      <div className="history-item-info" style={{borderBottomColor: MUTED_TEXT}}>
        <h4>{text}</h4>
        <AmountLabel amount={amount} isTopUp={isTopUp}/>
      </div>
    </div>
  );
};

const mapStateToProps = (
  { store: { items = [] } },
  { transaction }
) => {
  const isTopUp = transaction.type === 'topup';

  if (isTopUp) {
    return {
      isTopUp,
      amount: transaction.amount,
      image: require('./assets/top-up.svg'),
      text: 'TOP UP',
    };
  }

  const { itemId, quantity } = transaction.data;
  const foundItem = items.find(e => e.id === itemId);

  if (foundItem) {
    return {
      isTopUp,
      amount: transaction.amount,
      image: require(`../item/assets/${foundItem.image}`),
      text: `${foundItem.name}${quantity > 1 ? ` x ${quantity}` : ''}`
    };
  }

  // fallback/error case
  return {
    isTopUp,
    amount: transaction.amount,
    image: require('../item/assets/not-found.svg'),
    text: 'Unknown Item',
  };
};

export default connect(mapStateToProps)(HistoryItem);


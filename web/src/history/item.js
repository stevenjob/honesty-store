import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { BRAND_LIGHT } from '../chrome/colors';
import './item.css';
import Currency from '../format/Currency';

const AmountLabel = ({ amount, isTopUp }) => {
  if (isTopUp) {
    return (
      <h4 style={{ color: BRAND_LIGHT }}>
        <small>+ </small>
        <Currency amount={amount} />
      </h4>
    );
  }

  return (
    <h4>
      <Currency amount={Math.abs(amount)} />
    </h4>
  );
};

const HistoryItem = ({ isTopUp, text, timestamp, amount, image }) => {
  return (
    <div className="history-item">
      <div className="history-item-timestamp">{moment(timestamp).fromNow()}</div>
      <div className="history-item-details">
        <div
          className="history-item-image"
          style={{ backgroundImage: `url(${image})` }}
          alt={text}
        />
        <div className="history-item-info">
          <h4>{text}</h4>
          <AmountLabel amount={amount} isTopUp={isTopUp}/>
        </div>
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
      timestamp: transaction.timestamp,
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
      timestamp: transaction.timestamp,
      amount: transaction.amount,
      image: require(`../item/assets/${foundItem.image}`),
      text: `${foundItem.name}${quantity > 1 ? ` x ${quantity}` : ''}`
    };
  }

  // fallback/error case
  return {
    isTopUp,
    timestamp: transaction.timestamp,
    amount: transaction.amount,
    image: require('../item/assets/not-found.svg'),
    text: 'Unknown Item',
  };
};

export default connect(mapStateToProps)(HistoryItem);


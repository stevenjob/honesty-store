import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { BRAND_LIGHT } from '../chrome/colors';
import './item.css';
import Currency from '../format/Currency';
import Image from '../chrome/image';

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
        <Image
          className="history-item-image"
          imageName={image}
          alt={text}
          />
        <div className="history-item-info">
          <h4>{text}</h4>
          <AmountLabel amount={amount} isTopUp={isTopUp} />
        </div>
      </div>
    </div>
  );
};

const formatItem = (name, quantity) => `${name}${quantity > 1 ? ` x ${quantity}` : ''}`;

const mapStateToProps = (
  { store: { items = []} },
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

  return {
    isTopUp,
    timestamp: transaction.timestamp,
    amount: transaction.amount,
    image: foundItem.image,
    text: foundItem ? formatItem(foundItem.name, quantity) : 'Unknown Item',
  };
};

export default connect(mapStateToProps)(HistoryItem);


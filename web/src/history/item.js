import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import safeLookupItemImage from '../item/safeLookupItemImage';
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
  const { type, timestamp, amount, data } = transaction;
  switch (type) {
    case 'topup':
      return {
        isTopUp: true,
        timestamp,
        amount,
        image: require('./assets/top-up.svg'),
        text: 'TOP UP',
      };
    case 'purchase':
      const { item: { image, name }, quantity } = data;
      return {
        isTopUp: false,
        timestamp,
        amount,
        image: safeLookupItemImage(image),
        text: formatItem(name ? name : 'Unknown Item', quantity),
      };
    default:
      return {
        isTopUp: false,
      };
  }
};

export default connect(mapStateToProps)(HistoryItem);


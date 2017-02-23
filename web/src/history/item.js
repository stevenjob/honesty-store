import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import safeLookupItemImage from '../item/safeLookupItemImage';
import Currency from '../format/Currency';

const HistoryItem = ({ isTopUp, text, timestamp, amount, image }) => {
  return (
    <div className="btn regular navy col-12 flex">
      <div className="col-2 bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image})` }}>
        {'\u00a0'}
      </div>
      <div className="flex-column col-8 ml2">
        <h4 className="mt0 mb0">{text}</h4>
        <p className="mt0 mb0 h6">{moment(timestamp).fromNow()}</p>
      </div>
      <div className="col-2 ml1 flex items-center justify-end">
        <div className={isTopUp ? 'bold aqua' : ''}>
          {isTopUp && '+'}<Currency amount={Math.abs(amount)} />
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
        timestamp,
        text: 'Unknown',
        amount
      };
  }
};

export default connect(mapStateToProps)(HistoryItem);


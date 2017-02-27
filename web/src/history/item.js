import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import safeLookupItemImage from '../item/safeLookupItemImage';
import Currency from '../format/Currency';
import history from '../history';

const HistoryItem = ({ isTopUp, text, timestamp, amount, image, href }) => {
  return (
    <div className="btn regular navy col-12 flex" onClick={() => history.push(href)}>
      <div className="bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image})`, width: '2.375rem' }}>
        {'\u00a0'}
      </div>
      <div className="flex-column flex-auto ml2">
        <h4 className="mt0 mb0">{text}</h4>
        <p className="mt0 mb0 h6 gray">{moment(timestamp).fromNow()}</p>
      </div>
      <div className="col-2 ml1 flex flex-none items-center justify-end">
        <div className={`h3 bold ${isTopUp ? 'aqua' : ''}`}>
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
        href: '/topup'
      };
    case 'purchase':
      const { item: { id, image, name }, quantity } = data;
      return {
        isTopUp: false,
        timestamp,
        amount,
        image: safeLookupItemImage(image),
        text: formatItem(name ? name : 'Unknown Item', quantity),
        href: `/item/${id}`
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


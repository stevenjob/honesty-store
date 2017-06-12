import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import safeLookupItemImage from '../item/safeLookupItemImage';
import Currency from '../format/Currency';

const HistoryItem = ({
  isRefundable = false,
  type,
  title,
  subtitle,
  timestamp,
  amount,
  image,
  transactionId,
  href
}) => {
  return (
    <div
      className={`px2 py1 regular navy col-12 flex ${type === 'refund' ? 'grayscale' : ''}`}
    >
      <div
        className="bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image})`, width: '2.375rem' }}
      >
        {'\u00a0'}
      </div>
      <div className="flex-column flex-auto ml2">
        <Link className="navy" to={href}>
          <h4 className="my0">{title}</h4>
          {subtitle && <p className="mt0 mb0 h6">{subtitle}</p>}
        </Link>
        <p className="my0 h6 gray">{moment(timestamp).fromNow()}</p>
        <p className="my0 h6">
          {isRefundable &&
            <Link to={`refund/${transactionId}`}>Request a refund</Link>}
          {type === 'refund' && 'Refund issued'}
        </p>
      </div>
      <div className="col-2 ml1 flex flex-none items-center justify-end">
        <div className={`h3 bold ${type === 'topup' ? 'aqua' : ''}`}>
          {type === 'topup' && '+'}<Currency amount={Math.abs(amount)} />
        </div>
      </div>
    </div>
  );
};

const formatItem = (name, quantity) =>
  `${name}${quantity > 1 ? ` x ${quantity}` : ''}`;

const mapStateToProps = (
  { user: { transactions }, store: { items }, autoRefundPeriod },
  { transaction }
) => {
  const { type, timestamp, amount, data, id: transactionId } = transaction;

  const commonProps = { type, timestamp, amount, transactionId };

  switch (type) {
    case 'topup':
      return {
        ...commonProps,
        image: require('./assets/top-up.svg'),
        title: 'TOP UP',
        href: '/topup'
      };
    case 'purchase':
    case 'refund':
      const { item: { id: itemId, image, name, qualifier }, quantity } = data;
      const itemExistsInStore = items.some(item => item.id === itemId);
      return {
        ...commonProps,
        image: safeLookupItemImage(image),
        title: formatItem(name || 'Unknown Item', quantity),
        subtitle: qualifier,
        isRefundable: type === 'purchase' &&
          timestamp >= Date.now() - autoRefundPeriod,
        href: itemExistsInStore ? `/item/${itemId}` : `/history`
      };
    default:
      return {
        ...commonProps,
        text: 'Unknown'
      };
  }
};

export default connect(mapStateToProps)(HistoryItem);

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

const HistoryItem = ({ isTopUp, text, amount }) => {
  const imageRotation = isTopUp ? 0 : -35;
  const imagePath = isTopUp ? require('./assets/top-up.svg') : require('../store/assets/packet.svg');
  return (
    <div className="history-item">
      <img 
        src={imagePath}
        style={{ transform: `rotate(${imageRotation}deg)` }}
        alt={text}
      />
      <div className="history-item-info" style={{borderBottomColor: MUTED_TEXT}}>
        <h4>{text}</h4>
        <AmountLabel amount={amount} isTopUp={isTopUp}/>
      </div>
    </div>
  );
};

const getItemText = (data, items) => {
  const { itemId, quantity } = data;
  const foundItem = items.find(e => e.id === itemId);

  const itemText = foundItem != null ? foundItem.name : 'Unknown Item';
  const quantityText = quantity > 1 ? ` x ${quantity}` : '';
  return `${itemText}${quantityText}`;
};

const mapStateToProps = (
  { store: { items = [] } },
  { transaction }
) => {
  const isTopUp = transaction.type === 'topup';
  return {
    isTopUp,
    text: isTopUp ? 'TOP UP' : getItemText(transaction.data, items),
    amount: transaction.amount
  };
};

export default connect(mapStateToProps)(HistoryItem);


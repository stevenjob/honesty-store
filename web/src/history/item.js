import React from 'react';
import { connect } from 'react-redux';
import { MUTED_TEXT, BRAND_LIGHT } from '../chrome/colors';
import './item.css';
import currency from '../format/currency';

const AmountLabel = ({ amount, isTopUp }) => {
  if (isTopUp) {
    return <h4 style={{ color: BRAND_LIGHT }}><small>+ £</small>{currency(amount)}</h4>;
  }
  return <h4>{amount}<small>p</small></h4>;
};

const HistoryItem = ({ isTopUp, imagePath, text, amount }) => {
  const imageRotation = isTopUp ? 0 : -35;
  return (
    <div className="history-item">
      <img 
        src={imagePath}
        style={{ transform: `rotate(${imageRotation}deg)` }}
        alt="TODO" 
      />
      <div className="history-item-info" style={{borderBottomColor: MUTED_TEXT}}>
        <h4>{text}</h4>
        <AmountLabel amount={amount} isTopUp={isTopUp}/>
      </div>
    </div>
  );
};

const getItemNameById = (id, items) => {
  const foundItem = items.find(e => e.id === id);
  if (foundItem == null) {
    return 'Unknown Item';
  }
  return foundItem.name;
};

const mapStateToProps = (
  { store: { items = [] } },
  { transaction }
) => {
  const isTopUp = transaction.type === 'topup';
  return {
    isTopUp,
    imagePath: isTopUp ? require('./assets/top-up.svg') : require('../store/assets/packet.svg'),
    text: isTopUp ? 'TOP UP' : getItemNameById(transaction.data.itemId, items),
    amount: transaction.amount
  };
};

export default connect(mapStateToProps)(HistoryItem);


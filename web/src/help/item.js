import React from 'react';
import { connect } from 'react-redux';
import Help from './index';

const HelpOutOfStockInternal = ({ params: { itemId }, items }) => {
  const { name } = items.find(item => item.id === itemId);

  return (
    <Help message={`I've spotted a problem with ${name}`} />
  );
};

const mapStateToProps = ({ store: { items } }) => ({
  items
});

export default connect(mapStateToProps)(HelpOutOfStockInternal);

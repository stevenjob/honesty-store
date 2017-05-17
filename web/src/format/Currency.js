import React from 'react';
const formatNumber = amount => (amount / 100).toFixed(2);

const formatAny = value => {
  if (value == null) {
    throw new Error(`Null/undefined amount`);
  }
  if (typeof value === 'number') {
    return formatNumber(value);
  }
  throw new Error(`Parsing not supported`);
};

const Currency = ({ amount }) => {
  const showPence = Math.abs(amount) < 100;

  return (
    <span>
      {showPence || <small>£</small>}
      {showPence ? amount : formatAny(amount)}
      {showPence && <small>p</small>}
    </span>
  );
};

export default Currency;

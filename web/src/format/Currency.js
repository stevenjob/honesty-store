import React from 'react';
const formatNumber = (amount) => (amount / 100).toFixed(2);

const formatAny = (value) => {
    if (value == null) {
        throw new Error(`Null/undefined amount`);
    }
    if (typeof value === 'number') {
        return formatNumber(value);
    }
    throw new Error(`Parsing not supported`);
};

const Currency = ({ amount, smallSymbols = true }) => {
  const showPence = Math.abs(amount) < 100;

  const smallComponent = (content) =>
    smallSymbols ? <small>{content}</small> : <span>{content}</span>;

  return (
    <span>
      { showPence || smallComponent('£') }
      { showPence ? amount : formatAny(amount) }
      { showPence && smallComponent('p') }
    </span>
  );
};

export default Currency;

import React from 'react';
import Currency from '../format/Currency';
import './breakdown.css';

const row = ({ name, title, description, amount, subtotal }, index, array) => {
  let borderClass;

  switch (index) {
    case 0: borderClass = 'vertical-line-top'; break;
    case (array.length - 1): borderClass = 'vertical-line-bottom'; break;
    default: borderClass = 'vertical-line-middle';
  }
  return (
     <tr key={name}>
      <th className="col-10 left-align py1 relative">
        <div className={`vertical-line ${borderClass}`}></div>
        <div className="circle"></div>
        <div className="pl3">
          <p className="my0">{title}</p>
          <p className="my0 regular" style={{ fontSize: '0.8rem', color: '#5D7E91' }}>{description}</p>
        </div>
      </th>
      <td className="col-3 right-align py1 align-bottom">{amount}</td>
    </tr>
  );
};

export default ({ breakdown, isMarketplace }) => {
  const marketplaceDescription = isMarketplace ? 'Someone from your office buys it in bulk' : 'We buy it from our supplier';
  const fields = [
    { name: 'wholesaleCost', title: 'Wholesale', description: marketplaceDescription },
    { name: 'handlingFee', title: 'Handling fee', description: 'We store, pack, package and post it' },
    { name: 'serviceFee', title: 'Service fee', description: 'We take a bit to keep the store going' },
    { name: 'creditCardFee', title: 'Card fee', description: 'We pay the card processor' },
    { name: 'VAT', title: 'VAT', description: `We pay VAT on it` },
    { name: 'donation', title: 'Charity', description: `We give a bit to charity` }
  ];

  let subtotal = 0;
  const data = [];
  for (const { name, ...other } of fields) {
    const amount = breakdown[name];
    if (amount <= 0) {
      continue;
    }
    subtotal += amount;
    data.push({
      name,
      amount: <Currency amount={amount} />,
      ...other
    });
  }

  return subtotal === 0 ?
    <p>No breakdown available.</p> :
    <table className="table col-11 mx-auto" style={{ borderCollapse: 'collapse' }} >
      <tbody>
        {data.map(row)}
      </tbody>
    </table>;
};
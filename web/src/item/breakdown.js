import React from 'react';
import Currency from '../format/Currency';

const row = ({ name, label, amount, subtotal }) =>
  <tr key={name}>
    <th className="col-6 left-align">{label}</th>
    <td className="col-3 ">{amount}</td>
    <td className="col-3 right-align">{subtotal}</td>
  </tr>;

export default ({ breakdown }) => {
  const fields = [
    { name: 'wholesaleCost', label: 'Wholesale' },
    { name: 'warehousingCost', label: 'Storage' },
    { name: 'packagingCost', label: 'Packaging' },
    { name: 'packingCost', label: 'Packing' },
    { name: 'shippingCost', label: 'Postage' },
    { name: 'serviceFee', label: 'Service Fee' },
    { name: 'creditCardFee', label: 'Card Fee' },
    { name: 'VAT', label: 'VAT' }
  ];

  let subtotal = 0;
  const data = [];
  for (const { name, label } of fields) {
    const amount = breakdown[name];
    if (amount <= 0) {
      continue;
    }
    subtotal += amount;
    data.push({
      name,
      label,
      amount: <Currency amount={amount} />,
      subtotal: <Currency amount={subtotal} />
    });
  }

  return subtotal === 0 ?
    <p>No breakdown available.</p> :
    <table className="table mx-auto col-10">
      <tbody>
        <tr key={name}>
          <th className="col-6"></th>
          <th className="col-3">Cost</th>
          <th className="col-3 right-align">Total</th>
        </tr>
        {data.map(row)}
      </tbody>
    </table>;
};
import React from 'react';
import { Link } from 'react-router';
import { formatWithSymbol } from '../../format/Currency';

export default ({
  listing: {
    id,
    listCount,
    availableCount,
    purchaseCount,
    refundCount,
    revenue,
    name,
    qualifier,
    sellerEmail,
    price
  },
  storeCode,
  className
}) => {
  const itemListingPrefix = `/admin/listing/${storeCode}/item/${id}`;
  return (
    <tr className={className}>
      <td>
        {name}
        {qualifier ? ` ${qualifier}` : ''}
        {' '}
        <Link to={`${itemListingPrefix}/edit`}>(edit)</Link>
      </td>
      <td className="right-align">{formatWithSymbol(price)}</td>
      <td className="right-align">{listCount}</td>
      <td className="right-align">
        {availableCount} <Link to={`${itemListingPrefix}/available`}>
          (edit)
        </Link>
      </td>
      <td className="right-align">{purchaseCount - refundCount}</td>
      <td className="right-align">{formatWithSymbol(revenue)}</td>
      <td>{sellerEmail}</td>
      <td>
        <Link to={`${itemListingPrefix}/add-more`} className="block mb1">
          Add more
        </Link>
        <Link className="red" to={`${itemListingPrefix}/unlist`}>
          Unlist
        </Link>
      </td>
    </tr>
  );
};

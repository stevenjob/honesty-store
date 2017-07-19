import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { formatWithSymbol } from '../../format/Currency';
import { performRemoveListing } from '../../actions/remove-listing';

const ListingRow = ({
  listing: {
    id,
    listCount,
    availableCount,
    purchaseCount,
    refundCount,
    revenue,
    name,
    qualifier,
    sellerId,
    price
  },
  performRemoveListing,
  storeCode,
  className
}) => {
  return (
    <tr className={className}>
      <td>
        {name}
        {qualifier ? ` ${qualifier}` : ''}
        {' '}
        <Link to={`/admin/listing/${storeCode}/item/${id}/edit`}>(edit)</Link>
      </td>
      <td className="right-align">{formatWithSymbol(price)}</td>
      <td className="right-align">{listCount}</td>
      <td className="right-align">
        {availableCount} <Link
          to={`/admin/listing/${storeCode}/item/${id}/available`}
        >
          (edit)
        </Link>
      </td>
      <td className="right-align">{purchaseCount - refundCount}</td>
      <td className="right-align">{formatWithSymbol(revenue)}</td>
      <td>{sellerId.replace(/-.*/, '')}</td>
      <td>
        <Link
          to={`/admin/listing/${storeCode}/item/${id}/add-more`}
          className="block mb1"
        >
          Add more
        </Link>
        <Link
          className="red"
          onClick={() =>
            performRemoveListing({
              storeCode,
              itemId: id
            })}
          style={{ cursor: 'pointer' }}
        >
          Unlist
        </Link>
      </td>
    </tr>
  );
};

export default connect(() => ({}), {
  performRemoveListing
})(ListingRow);

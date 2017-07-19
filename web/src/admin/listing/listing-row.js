import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Currency from '../../format/Currency';
import { performUpdateListingCount } from '../../actions/update-listing-count';
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
  performUpdateListingCount,
  performRemoveListing,
  storeCode,
  className
}) => {
  const promptForItemAvailability = itemId => {
    const count = prompt('How many items are available?');
    if (count == null || count === '') return;
    performUpdateListingCount({
      itemId: id,
      storeCode,
      count: Number(count)
    });
  };

  return (
    <tr className={className}>
      <td>
        {name}
        {qualifier ? ` ${qualifier}` : ''}
        {' '}
        <Link to={`/admin/listing/${storeCode}/item/${id}/edit`}>(edit)</Link>
      </td>
      <td className="right-align"><Currency amount={price} /></td>
      <td className="right-align">{listCount}</td>
      <td className="right-align">
        {availableCount} <Link
          onClick={() => promptForItemAvailability(id)}
          style={{ cursor: 'pointer' }}
        >
          (edit)
        </Link>
      </td>
      <td className="right-align">{purchaseCount - refundCount}</td>
      <td className="right-align"><Currency amount={revenue} /></td>
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
  performUpdateListingCount,
  performRemoveListing
})(ListingRow);

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { performUpdateListingCount } from '../../actions/update-listing-count';
import { performRemoveListing } from '../../actions/remove-listing';

const ListingRow = ({
  listing: {
    id,
    availableCount,
    purchaseCount,
    refundCount,
    name,
    qualifier,
    sellerId
  },
  performUpdateListingCount,
  performRemoveListing,
  storeCode
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
    <tr>
      <td>
        {name}
        {qualifier ? ` ${qualifier}` : ''}
        {' '}
        <Link to={`/admin/listing/${storeCode}/item/${id}/edit`}>(edit)</Link>
      </td>
      <td>
        {availableCount} <Link
          onClick={() => promptForItemAvailability(id)}
          style={{ cursor: 'pointer' }}
        >
          (edit)
        </Link>
      </td>
      <td>{purchaseCount}</td>
      <td>{refundCount}</td>
      <td>{sellerId.replace(/-.*/, '')}</td>
      <td>
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

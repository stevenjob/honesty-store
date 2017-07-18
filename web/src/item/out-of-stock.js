import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { performOutOfStock } from '../actions/out-of-stock';
import Full from '../layout/full';
import { BackToPage } from '../chrome/link';
import isLikedItem from '../reducers/is-liked-item';
import { StockLevel } from './stocklevel';

export const Report = ({ itemId, children }) => (
  <Link to={`/help/item/${itemId}`}>
    {children}
  </Link>
);

const OutOfStockInternal = ({
  item: { id: itemId, name, isLiked, count },
  performOutOfStock
}) => {
  return (
    <Full left={<BackToPage path={`/item/${itemId}`} />}>
      <h1>
        Report stock issue
      </h1>
      <h2>
        {name}
      </h2>
      <div className="mb3">
        <StockLevel count={count} />
      </div>
      <p>
        We estimate stock levels by keeping track of purchases, but it doesn't always work out.
      </p>
      <p>
        If this doesn't look right, please let us know by marking it out of stock or reporting a problem.
      </p>
      <div className="my3">
        <Link
          className="btn btn-primary"
          onClick={() => performOutOfStock({ itemId })}
        >
          Mark as out of stock
        </Link>
      </div>
      <Report itemId={itemId}>
        Report a problem
      </Report>
    </Full>
  );
};

const mapStateToProps = (
  { store: { items }, likedItemIds },
  { params: { itemId } }
) => {
  const item = items.find(({ id }) => id === itemId);

  return {
    item: {
      ...item,
      isLiked: isLikedItem(item, likedItemIds)
    }
  };
};

const mapDispatchToProps = { performOutOfStock };
export default connect(mapStateToProps, mapDispatchToProps)(OutOfStockInternal);

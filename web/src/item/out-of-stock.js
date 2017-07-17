import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { performOutOfStock } from '../actions/out-of-stock';
import Full from '../layout/full';
import { BackToPage } from '../chrome/link';
import isLikedItem from '../reducers/is-liked-item';

export const Report = ({ itemId }) => (
  <Link to={`/help/item/${itemId}`}>Report a problem</Link>
);

const countRating = count => {
  if (count <= 5) {
    return {
      desc: 'Low',
      colour: 'bg-red',
      percentage: 10
    };
  }
  if (count <= 10) {
    return {
      desc: 'Medium',
      colour: 'bg-yellow',
      percentage: 50
    };
  }
  return {
    desc: 'High',
    colour: 'bg-aqua',
    percentage: 90
  };
};

const OutOfStockInternal = ({
  item: { id: itemId, name, isLiked, count },
  performOutOfStock
}) => {
  const { desc, colour, percentage } = countRating(count);

  return (
    <Full left={<BackToPage path={`/item/${itemId}`} title="Out of Stock" />}>
      <h1>
        Report stock issue
      </h1>
      <h2>
        {name}
      </h2>
      <p>
        Stock Level: <b>{desc}</b>
      </p>
      <div
        className="bg-lightgray flex rounded my2 mx-auto col-2"
        style={{
          height: '0.5rem',
          overflow: 'hidden'
        }}
      >
        <div
          className={`inline-block col-2 ${colour}`}
          style={{
            width: `${percentage}%`
          }}
        />
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
      <Report itemId={itemId} />
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
export const OutOfStock = connect(mapStateToProps, mapDispatchToProps)(
  OutOfStockInternal
);

export default OutOfStock;

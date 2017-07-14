import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import history from '../history';
import { BackToPage } from '../chrome/link';
import { performPurchase } from '../actions/purchase';
import Currency from '../format/Currency';
import { performUnlikeItem, performLikeItem } from '../actions/like-item';
import isRegistered from '../reducers/is-registered-user';
import isLikedItem from '../reducers/is-liked-item';
import safeLookupItemImage from './safeLookupItemImage';
import Full from '../layout/full';
import Breakdown from './breakdown';
import Like from './like';
import FlagOutOfStock from './out-of-stock';

const Depleted = ({ registered }) => (
  <p className="red">This item has been reported out of stock</p>
);

const Report = ({ itemId }) => (
  <Link to={`/help/item/${itemId}`}>Report a problem</Link>
);

const ItemDetail = ({
  item: {
    id,
    name,
    price: { breakdown, total },
    image,
    count,
    qualifier,
    notes,
    isMarketplace,
    isLiked
  },
  balance,
  performLikeItem,
  performUnlikeItem,
  performPurchase,
  registered
}) => {
  const calculateBalanceRemaining = numItems => balance - total * numItems;

  const onClick = numItems => {
    const balance = calculateBalanceRemaining(numItems);
    if (balance < 0) {
      history.push(`/topup`);
    } else {
      performPurchase({ itemId: id, quantity: numItems });
    }
  };

  const handleLikeOrUnlikeClick = () => {
    if (isLiked) {
      performUnlikeItem(id);
    } else {
      performLikeItem(id);
    }
  };

  const buttonClasses = `btn btn-primary ${isMarketplace ? 'btn-more' : ''}`;

  const registeredPurchaseButton = (
    <Link className={buttonClasses} onClick={() => onClick(1)}>
      Pay <Currency amount={total} />
    </Link>
  );

  const unregisteredPurchaseButton = (
    <Link className={buttonClasses} to={`/register/${id}`}>
      Pay <Currency amount={total} />
    </Link>
  );

  return (
    <Full
      left={<BackToPage path="/store" title="Store" />}
      right={<Like isLiked={isLiked} onClick={handleLikeOrUnlikeClick} />}
    >
      {id != null &&
        <div>
          <h1 className="mt1 mb0">{name}</h1>
          {qualifier &&
            <h3 className="mt0 aqua regular">
              {qualifier}
            </h3>}
          <div className="col-6 mx-auto">
            <div
              className={`bg-center bg-no-repeat ${count === 0 ? 'grayscale' : ''}`}
              style={{
                backgroundImage: `url(${safeLookupItemImage(image)})`,
                paddingBottom: '100%',
                lineHeight: 0
              }}
            >
              {'\u00a0'}
            </div>
          </div>
          <div className="my3">
            {registered ? registeredPurchaseButton : unregisteredPurchaseButton}
          </div>
          {notes && <p>{notes}</p>}
          <ul className="list-reset">
            <li>Remaining: <strong>{count}</strong></li>
          </ul>
          <div>
            {count <= 0
              ? <Depleted registered={registered} />
              : registered ? <FlagOutOfStock itemId={id} /> : null}
          </div>
          <div>
            <h4 className="mt3">Price Breakdown</h4>
            <p>Its journey to you</p>
            <Breakdown breakdown={breakdown} isMarketplace={isMarketplace} />
          </div>
          <div className="mt3 mb1">
            <Report itemId={id} />
          </div>
        </div>}
    </Full>
  );
};

const mapStateToProps = (
  { store: { items = [] }, user, likedItemIds },
  { params: { itemId } }
) => {
  const item = (() => {
    const i = items.find(el => el.id === itemId);
    return {
      ...i,
      isLiked: isLikedItem(i, likedItemIds)
    };
  })();
  const { balance } = user;
  return {
    item,
    balance,
    registered: isRegistered(user)
  };
};

const mapDispatchToProps = {
  performPurchase,
  performLikeItem,
  performUnlikeItem
};

export default connect(mapStateToProps, mapDispatchToProps)(ItemDetail);

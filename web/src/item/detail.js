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
import { StockLevel } from './stocklevel';
import Like from './like';
import { Report } from './out-of-stock';

const Depleted = ({ registered }) => (
  <p className="red">This item has been reported out of stock</p>
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
      history.push(`/topup/500`);
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

  const OutOfStockLink = () => (
    <Link to={`/item/${id}/out-of-stock`}>
      Report out of Stock
    </Link>
  );

  return (
    <Full
      left={<BackToPage path="/store" title="Store" />}
      right={<Like isLiked={isLiked} onClick={handleLikeOrUnlikeClick} />}
    >
      {id != null &&
        <div className="justify-between">
          <div className="my3">
            <h1 className="my0">{name}</h1>
            {qualifier &&
              <h3 className="aqua regular mb0 mt1">
                {qualifier}
              </h3>}
          </div>
          <div className="col-6 mx-auto my3">
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
            <div>
              {registered
                ? registeredPurchaseButton
                : unregisteredPurchaseButton}
            </div>
            {registered &&
              <div className="gray my2">
                Your balance will be
                {' '}
                <Currency amount={calculateBalanceRemaining(1)} />
              </div>}
            {notes && <p>{notes}</p>}
          </div>
          <div className="my3">
            <StockLevel count={count} />
            <div className="my2">
              {count <= 0
                ? <Depleted registered={registered} />
                : registered ? <OutOfStockLink itemId={id} /> : null}
            </div>
          </div>
          <div className="my3">
            <Report itemId={id}>
              Spotted a problem with this product?
            </Report>
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

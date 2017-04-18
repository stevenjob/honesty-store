import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import history from '../history';
import { Back } from '../chrome/link';
import Currency from '../format/Currency';
import { performPurchase } from '../actions/purchase';
import { performUnlikeItem, performLikeItem } from '../actions/like-item';
import isRegistered from '../reducers/is-registered-user';
import isLikedItem from '../reducers/is-liked-item';
import safeLookupItemImage from './safeLookupItemImage';
import Full from '../layout/full';
import Breakdown from './breakdown';
import Like from './like';
import FlagOutOfStock from './out-of-stock';

const Depleted = ({ registered, itemId }) => (
  <p>
    This item has been reported out of stock
    <br />
    <Link className="m1" to={`/help/item/${itemId}`}>
      Report a Problem
    </Link>
  </p>
);

const ItemDetail = ({
  item: { id, name, price: { breakdown, total }, image, count, unit, unitPlural, qualifier, notes, weight, location, isMarketplace, isLiked, expires },
  balance,
  performLikeItem,
  performUnlikeItem,
  performPurchase,
  registered
}) => {
  const calculateBalanceRemaining = (numItems) => balance - (total * numItems);

  const payForText = (count) =>
    count !== 1
    ? `Pay for ${count} ${unitPlural}`
    : <span>Pay <Currency amount={total} /> for 1 {unit}</span>;

  const onClick = (numItems) => {
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

  const registeredPurchaseButton =
    <Link className={buttonClasses} onClick={() => onClick(1)}>
      {payForText(1)}
    </Link>;

  const unregisteredPurchaseButton =
    <Link className={buttonClasses} to={`/register/${id}`}>
      {payForText(1)}
    </Link>;

  return (
    <Full
      left={<Back />}
      right={<Like isLiked={isLiked} onClick={handleLikeOrUnlikeClick}/>}
      >
      {id != null &&
        <div>
          <h1 className="mt1 mb0">{name}</h1>
          {
            qualifier &&
            <h3 className="mt0 aqua regular">
              {qualifier}
            </h3>
          }
          <div className="col-6 mx-auto">
            <div className="bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${safeLookupItemImage(image)})`, paddingBottom: '100%', lineHeight: 0 }}>
              {'\u00a0'}
            </div>
          </div>
          <div className="my3">
            {registered ? registeredPurchaseButton : unregisteredPurchaseButton}
          </div>
          {
            notes &&
            <p>{notes}</p>
          }
          <ul className="list-reset">
            {
              weight &&
              <li>Weight: <strong>{`${weight}g`}</strong></li>
            }
            {
              location &&
              <li>Location: <strong>{location}</strong></li>
            }
            {
              expires &&
              <li>Expires: <strong>{expires}</strong></li>
            }
          </ul>
          <div>
            {
              count === 0 ?
              <Depleted registered={registered} itemId={id} /> :
              registered ?
              <FlagOutOfStock itemId={id} /> :
              null
            }
          </div>
          <h4 className="mt3">Price Breakdown</h4>
          <p>Your snack's journey to you</p>
          <Breakdown breakdown={breakdown}/>
        </div>
      }
    </Full>
  );
};

const mapStateToProps = (
  { store: { items = []}, user, likedItemIds },
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
    item: item,
    balance,
    registered: isRegistered(user),
  };
};

const mapDispatchToProps = { performPurchase, performLikeItem, performUnlikeItem };

export default connect(mapStateToProps, mapDispatchToProps)(ItemDetail);

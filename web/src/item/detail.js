import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import history from '../history';
import { Back } from '../chrome/link';
import Currency from '../format/Currency';
import { performPurchase } from '../actions/purchase';
import isRegistered from '../reducers/is-registered-user';
import safeLookupItemImage from './safeLookupItemImage';
import Full from '../layout/full';
import Breakdown from './breakdown';
import Like from './like';
import FlagOutOfStock from './out-of-stock';

const Depleted = ({ registered, itemId }) => (
  <div>
    This item has been reported out of stock
    <br />
    <Link className="m1" to={`/help/item/${itemId}`}>
      Report a Problem
    </Link>
  </div>
);

const ItemDetail = ({
  item: { id, name, price: { breakdown, total }, image, count, unit, unitPlural, qualifier, notes, weight, location, isMarketplace },
  balance,
  performPurchase,
  registered,
  isLiked
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

  const handleLikeClick = () => {
    console.log('LIKE CLICKED!');
  };

  const buttonClasses = `btn btn-primary btn-big ${isMarketplace ? 'btn-more' : ''}`;

  const registeredPurchaseButton = <p>
    <Link className={buttonClasses} onClick={() => onClick(1)}>
      {payForText(1)}
    </Link>
  </p>;

  const unregisteredPurchaseButton = <p>
    <Link className={buttonClasses} to={`/register/${id}`}>
      {payForText(1)}
    </Link>
  </p>;

  return (
    <Full
      left={<Back />}
      right={<Like isLiked={isLiked} onClick={handleLikeClick}/>}
      >
      {id != null &&
        <div>
          <div className="col-4 mt3 mx-auto">
            <div className="bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${safeLookupItemImage(image)})`, paddingBottom: '100%', lineHeight: 0 }}>
              {'\u00a0'}
            </div>
          </div>
          <h1 className="mt1 mb0">{name}</h1>
          {
            qualifier &&
            <h3 className="mt0 mb3 aqua regular">
              {qualifier}
            </h3>
          }
          {registered ? registeredPurchaseButton : unregisteredPurchaseButton}
          <p>
            {
              count === 0 ?
              <Depleted registered={registered} itemId={id} /> :
              registered ?
              <FlagOutOfStock itemId={id} /> :
              null
            }
          </p>
          <h3 className="mt3">Item Details</h3>
          {
            notes &&
            <p>{notes}</p>
          }
          <table className="table mx-auto">
            <tbody>
              {
                location &&
                <tr>
                  <th className="col-6 right-align">Location</th>
                  <td>{location}</td>
                </tr>
              }
              {
                weight &&
                <tr>
                    <th className="col-6 right-align">Weight</th>
                    <td>{`${weight}g`}</td>
                </tr>
              }
            </tbody>
          </table>
          <h3>Price Breakdown</h3>
          <p>Storage, packaging, packing, postage and the service fee are shared equally across all items in a box.</p>
          <Breakdown breakdown={breakdown}/>
        </div>
      }
    </Full>
  );
};

const mapStateToProps = (
  { store: { items = []}, user },
  { params: { itemId } }
) => {
  const item = items.find(el => el.id === itemId);
  const isLiked = false;
  const { balance } = user;
  return {
    item: item || {},
    balance,
    registered: isRegistered(user),
    isLiked
  };
};

const mapDispatchToProps = { performPurchase };

export default connect(mapStateToProps, mapDispatchToProps)(ItemDetail);

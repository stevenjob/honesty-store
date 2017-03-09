import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import history from '../history';
import { Back } from '../chrome/link';
import Stepper from '../chrome/stepper';
import Currency from '../format/Currency';
import { performPurchase } from '../actions/purchase';
import isRegistered from '../reducers/is-registered-user';
import safeLookupItemImage from './safeLookupItemImage';
import Full from '../layout/full';
import FlagOutOfStock from './out-of-stock';

const minNumItems = 1;

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
  item: { id, name, price, image, count, unit, unitPlural, qualifier, notes, weight, location },
  balance,
  performPurchase,
  registered
}) => {
  const calculateBalanceRemaining = (numItems) => balance - (price * numItems);

  const decrementNumItems = (numItems) => Math.max(minNumItems, numItems - 1);

  const formatBalance = (numItems) => {
    const balance = calculateBalanceRemaining(numItems);
    return (
      <span>
        Your balance will be <Currency amount={balance} />
      </span>
    );
  };

  const payForText = (count) =>
    count !== 1
    ? `Pay for ${count} ${unitPlural}`
    : `Pay for 1 ${unit}`;

  const formatPurchaseButton = (numItems) => {
    const balance = calculateBalanceRemaining(numItems);
    if (balance < 0) {
      return {
        disabled: true,
        text: `Insufficient funds`
      };
    }
    return {
      disabled: false,
      text: payForText(numItems)
    };
  };

  const onClick = (numItems) => {
    const balance = calculateBalanceRemaining(numItems);
    if (balance < 0) {
      history.push(`/topup`);
    } else {
      performPurchase({ itemId: id, quantity: numItems });
    }
  };

  const purchaseStepper = <Stepper
    label={`How many ${unitPlural} would you like to pay for?`}
    onDecrement={decrementNumItems}
    incrementDisabled={() => false}
    onIncrement={(numItems) => numItems + 1}
    decrementDisabled={(numItems) => numItems <= 1}
    formatDescription={formatBalance}
    formatValue={(numItems) => numItems}
    formatButton={formatPurchaseButton}
    initialValue={1}
    onClick={onClick}
    />;

  const unregisteredPurchaseButton = <p>
    <Link className="btn btn-primary btn-big" to={`/register/${id}`}>
      {payForText(1)}
    </Link>
  </p>;

  return (
    <Full top={<Back />}>
      {id != null &&
        <div>
          <h1>{name}</h1>
          <h2 className=""><Currency amount={price} /></h2>
          <div className="col-6 mx-auto">
            <div className="bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${safeLookupItemImage(image)})`, paddingBottom: '100%' }}>
              {'\u00a0'}
            </div>
          </div>
          <table className="table mx-auto">
            <tbody>
              {
                location &&
                <tr>
                  <th>Location</th>
                  <td>{location}</td>
                </tr>
              }
              <tr>
                  <th>Weight</th>
                  <td>{`${weight}g`}</td>
              </tr>
            </tbody>
          </table>
          <p>{notes}</p>
          {registered ? purchaseStepper : unregisteredPurchaseButton}
          {
            count === 0 ?
            <Depleted registered={registered} itemId={id} /> :
            registered ?
            <FlagOutOfStock itemId={id} /> :
            null
          }
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
  const { balance } = user;
  return {
    item: item || {},
    balance,
    registered: isRegistered(user)
  };
};

const mapDispatchToProps = { performPurchase };

export default connect(mapStateToProps, mapDispatchToProps)(ItemDetail);

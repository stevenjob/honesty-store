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

const Depleted = ({ depleted, registered, itemId }) => {
  if (depleted) {
    return (
      <div>
        This item has been reported out of stock - please contact support if we've made a mistake!
        <br />
        <Link className="btn btn-primary m1" to={`/help/itemOutOfStock/${itemId}`}>
          Contact Us
        </Link>
      </div>
    );
  }
  if (registered) {
    return <FlagOutOfStock itemId={itemId} />;
  }
  return null;
};

const ItemDetail = ({
  item: { id, name, price, image, depleted },
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
      text: `Pay for ${numItems} ${name}`
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
    label="How many would you like to pay for?"
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
      {`Pay for 1 ${name}`}
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
          {registered ? purchaseStepper : unregisteredPurchaseButton}
          <Depleted depleted={depleted} registered={registered} itemId={id} />
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

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Chrome from '../layout/chrome';
import List from '../chrome/list';
import StoreItem from './item';
import MiscSelection from '../item/misc-selection';
import isRegisteredUser from '../reducers/is-registered-user';
import Balance from '../topup/balance';
import { performDestroySession } from '../actions/destroy-session';

const Home = ({ onClick }) =>
  <Link className="btn" onClick={onClick}>Home</Link>;

const SignIn = () =>
  <Link className="btn" to="/register">Sign In</Link>;

const itemRenderer = (item, index) => <StoreItem item={item} />;

const SpecialEntry = ({ to, title, message }) => (
  <div className="border-gray border-bottom bg-white mb2">
    <Link to={to} className="btn regular flex items-center justify-between navy">
      <div>
        <h3>
          {title}
        </h3>
        <p className="aqua">
          {message}
        </p>
      </div>
      <div className="" style={{ width: '5rem' }}>
        <MiscSelection />
      </div>
    </Link>
  </div>
);

const Store = ({ registered, showMarketplace, storeCode, balance, items, surveyAvailable, performDestroySession }) =>
  <Chrome title={storeCode || 'Store'}
    left={!registered && <Home onClick={performDestroySession} />}
    right={registered ? <Balance balance={balance} /> : <SignIn />}
    nav={registered}>
    {
      surveyAvailable &&
      <SpecialEntry
        to={`/survey`}
        title="Think we're missing something?"
        message="Tap here to take a quick survey"
        />
    }
    {
      registered &&
      showMarketplace &&
      <SpecialEntry
        to={`/more`}
        title="Want to improve the variety?"
        message="Tap here to list your own items"
        />
    }
    <List data={items} itemRenderer={itemRenderer} />
  </Chrome>;

const storeOrdering = (items) => {
  const inStock = items.filter(item => item.count > 0);
  const depleted = items.filter(item => item.count === 0);

  return [
    ...inStock,
    ...depleted
  ];
};

const mapStateToProps = ({ user, store: { code, items }, survey }) => ({
  registered: isRegisteredUser(user),
  showMarketplace: user.features.marketplace,
  storeCode: code,
  balance: user.balance || 0,
  items: storeOrdering(items),
  surveyAvailable: survey != null
});

export default connect(mapStateToProps, { performDestroySession })(Store);

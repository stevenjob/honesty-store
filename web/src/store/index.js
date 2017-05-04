import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Chrome from '../layout/chrome';
import List from '../chrome/list';
import StoreItem from './item';
import MiscSelection from '../item/misc-selection';
import isRegisteredUser from '../reducers/is-registered-user';
import isLikedItem from '../reducers/is-liked-item';
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
      <MiscSelection style={{ width: '5rem', height: '5rem' }}/>
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
        title="Want to see more?"
        message="Find out how to list your own items"
        />
    }
    <List data={items} itemRenderer={itemRenderer} />
  </Chrome>;

const storeOrdering = (items) => {
  const nameComparison = (a, b) => {
    const itemAName = a.name.toLowerCase();
    const itemBName = b.name.toLowerCase();

    if (itemAName < itemBName) return -1;
    if (itemAName > itemBName) return 1;

    return 0;
  };
  const likedItemsComparison = (a, b) => b.isLiked - a.isLiked;
  const depletionComparison = (a, b) => !!b.count - !!a.count;

  return items.slice().sort((a, b) => {
    if (depletionComparison(a, b)) return depletionComparison(a, b);
    if (likedItemsComparison(a, b)) return likedItemsComparison(a, b);
    return nameComparison(a, b);
  });
};

const mapStateToProps = ({ user, store: { code, items = [] }, survey, likedItemIds }) => {
  const itemsWithLikeProp = items.map((item) => ({
    ...item,
    isLiked: isLikedItem(item, likedItemIds)
  }));
  const { features, balance = 0 } = user;

  return {
    registered: isRegisteredUser(user),
    showMarketplace: features ? features.marketplace : false,
    storeCode: code,
    balance,
    items: storeOrdering(itemsWithLikeProp),
    surveyAvailable: survey != null
  };
};

export default connect(mapStateToProps, { performDestroySession })(Store);

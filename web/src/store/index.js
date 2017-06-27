import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Chrome from '../layout/chrome';
import List from '../chrome/list';
import StoreItem from './item';
import MiscSelection from '../item/misc-selection';
import isRegisteredUser from '../reducers/is-registered-user';
import isLikedItem from '../reducers/is-liked-item';
import { performDestroySession } from '../actions/destroy-session';

const itemRenderer = (item, index) => <StoreItem item={item} />;

const SpecialEntry = ({ to, title, children }) => (
  <div className="border-gray border-top border-bottom bg-white mt3 mb3">
    <Link
      to={to}
      className="btn regular flex items-center justify-between navy"
    >
      <div>
        <h3>
          {title}
        </h3>
        <div className="aqua">
          {children}
        </div>
      </div>
      <MiscSelection style={{ width: '5rem', height: '5rem' }} />
    </Link>
  </div>
);

const Store = ({
  registered,
  storeCode,
  balance,
  items,
  performDestroySession
}) => (
  <Chrome>
    <SpecialEntry to={`/store`} title={`Welcome to the ${storeCode} store`}>
      <p>
        Something missing? Feature request?
      </p>
      <p>
        Share your thoughts in the SL Slack #honesty-store channel.
      </p>
    </SpecialEntry>
    <List data={items} itemRenderer={itemRenderer} />
  </Chrome>
);

const storeOrdering = items => {
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

const mapStateToProps = ({
  user,
  store: { code, items = [] },
  survey,
  likedItemIds
}) => {
  const itemsWithLikeProp = items.map(item => ({
    ...item,
    isLiked: isLikedItem(item, likedItemIds)
  }));
  const { balance = 0 } = user;

  return {
    registered: isRegisteredUser(user),
    storeCode: code,
    balance,
    items: storeOrdering(itemsWithLikeProp)
  };
};

export default connect(mapStateToProps, { performDestroySession })(Store);

import React from 'react';
import { connect } from 'react-redux';
import Chrome from '../layout/chrome';
import List from '../chrome/list';
import StoreItem from './item';
import isRegisteredUser from '../reducers/is-registered-user';
import isLikedItem from '../reducers/is-liked-item';
import { performDestroySession } from '../actions/destroy-session';

const itemRenderer = (item, index) => <StoreItem item={item} />;

const Store = ({
  registered,
  storeCode,
  balance,
  items,
  performDestroySession
}) => (
  <Chrome>
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
  const depletionComparison = (a, b) => (b.count > 0) - (a.count > 0);

  return items.slice().sort((a, b) => {
    if (depletionComparison(a, b)) return depletionComparison(a, b);
    if (likedItemsComparison(a, b)) return likedItemsComparison(a, b);
    return nameComparison(a, b);
  });
};

const mapStateToProps = ({
  user,
  store: { code, items = [] },
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

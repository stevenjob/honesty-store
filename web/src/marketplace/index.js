import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import List from '../chrome/list';
import { formatAny } from '../format/Currency';
import monthFromDate from '../format/date';
import Chrome from '../layout/chrome';
import ItemListing from './item-listing';

const MonthyRevenue = ({ month, total = 0 }) => (
  <div>
    <h2 className="navy my0">£{formatAny(total)}</h2>
    <h4 className="gray regular my0 center">{month}</h4>
  </div>
);

const More = ({ items, userRevenue }) => (
  <Chrome>
    <div className="p2 bg-white">
      <h3 className="regular navy center my2">Your total monthly revenue</h3>
      <div className="flex justify-around mt2 mb1">
        {userRevenue.map(({ startInclusive, total }) => (
          <MonthyRevenue
            key={startInclusive}
            month={monthFromDate(new Date(startInclusive))}
            total={total}
          />
        ))}
      </div>
    </div>
    <div className="center bg-white border-bottom border-silver p2 mt2">
      <Link to="/more/list/details">+ Add a new item</Link>
    </div>
    <List data={items} itemRenderer={item => <ItemListing item={item} />} />
  </Chrome>
);

const mapStateToProps = ({
  user: { id: userId },
  store: { items = [], userRevenue = [] }
}) => ({
  items: items.filter(({ sellerId }) => sellerId === userId),
  userRevenue: userRevenue.sort((a, b) => a.startInclusive - b.startInclusive)
});

export default connect(mapStateToProps)(More);

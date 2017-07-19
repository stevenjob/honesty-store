import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { formatWithSymbol } from '../../format/Currency';
import monthFromDate from '../../format/date';
import ListingRow from './listing-row';
import './index.css';

const ItemListings = ({
  items,
  revenue,
  params: { code },
  performUpdateListingCount
}) => (
  <div className="col-12 md-col-11 lg-col-10 mx-auto">
    <div className="my1 col-right">
      <Link className="btn btn-primary" to={`/admin/listing/${code}/item`}>
        Add listing
      </Link>
    </div>
    <table className="col-12 admin-table">
      <thead>
        <tr className="left-align">
          <th>Item</th>
          <th>Price</th>
          <th>List Count</th>
          <th>Available</th>
          <th>Sold</th>
          <th>Revenue</th>
          <th>Seller Id</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <ListingRow
            key={index}
            listing={item}
            storeCode={code}
          />
        ))}
      </tbody>
    </table>
    <h3>Revenue</h3>
    <table className="col-12 admin-table">
      <thead>
        <tr>
          <th className="left-align">Seller Id</th>
          {revenue.length > 0 &&
            revenue[0].value.map((item, index) => (
              <th key={index} className="right-align">{item.label}</th>
            ))}
        </tr>
      </thead>
      <tfoot>
        <tr>
          <th className="left-align">Total</th>
          {revenue.length > 0 &&
            revenue[0].value.map((item, index) => (
              <th key={index} className="right-align">
                {formatWithSymbol(item.total)}
              </th>
            ))}
        </tr>
      </tfoot>
      <tbody>
        {revenue.map((item, index) => (
          <tr key={index}>
            <td className="left-align">{item.label}</td>
            {item.value.map((item, index) => (
              <td key={index} className="right-align">
                {formatWithSymbol(item.value)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const mapStateToProps = ({
  admin: { store: { items = [], revenue = [] } = {} }
}) => {
  const allSellers = new Set();
  for (const month of revenue) {
    for (const sellerId of Object.keys(month.seller)) {
      allSellers.add(sellerId);
    }
  }
  const sparseRevenue = [...allSellers].map(sellerId => {
    return {
      label: sellerId.replace(/-.*/, ''),
      value: revenue.map(month => {
        const date = new Date(month.startInclusive);
        return {
          label: `${monthFromDate(date)} ${date.getUTCFullYear()}`,
          value: month.seller[sellerId] || 0,
          total: month.total
        };
      })
    };
  });
  return {
    items: items.sort((a, b) => {
      const result = a.name.localeCompare(b.name);
      if (result !== 0) return result;
      return a.qualifier(b.qualifier);
    }),
    revenue: sparseRevenue
  };
};

export default connect(mapStateToProps)(ItemListings);

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ListingRow from './listing-row';

const ItemListings = ({
  listings,
  params: { code },
  performUpdateListingCount
}) => (
  <div className="col-10 mx-auto">
    <div className="my1 col-right">
      <Link className="btn btn-primary" to={`/admin/listing/${code}/item`}>
        Add listing
      </Link>
    </div>
    <table className="col-12">
      <thead>
        <tr className="left-align">
          <th>Item</th>
          <th>Available</th>
          <th>Purchased</th>
          <th>Refunded</th>
          <th>Seller Id</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {listings.map((listing, index) => (
          <ListingRow key={index} listing={listing} storeCode={code} />
        ))}
      </tbody>
    </table>
  </div>
);

const mapStateToProps = ({ admin: { listings = [] } }) => ({
  listings
});

export default connect(mapStateToProps)(ItemListings);

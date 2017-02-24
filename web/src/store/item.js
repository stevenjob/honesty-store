import React from 'react';
import { Link } from 'react-router';
import safeLookupItemImage from '../item/safeLookupItemImage';
import Currency from '../format/Currency';

export default ({ item: { id, name, price, image } }) =>
  <Link to={`/item/${id}`} className="btn regular flex navy">
    <div className="flex-none col-3 bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${safeLookupItemImage(image)})` }}>
      {'\u00a0'}
    </div>
    <div className="ml2 flex-auto flex flex-column justify-center">
      <h2 className="h2 mt1 mb1">
        {name}
      </h2>
      <p className="mt1 mb1">
        <Link to={`/item/${id}`}>More Info</Link>
      </p>
    </div>
    <div className="ml2 flex-none flex flex-column justify-around">
      <h2 className="mt0 mb0">
        <Link to={`/item/${id}`} className="block btn btn-primary btn-big">
          <Currency amount={price} />
        </Link>
      </h2>
    </div>
  </Link>;

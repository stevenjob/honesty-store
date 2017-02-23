import React from 'react';
import { Link } from 'react-router';
import safeLookupItemImage from '../item/safeLookupItemImage';
import Currency from '../format/Currency';

export default ({ item: { id, name, price, image } }) =>
  <Link to={`/item/${id}`} className="btn regular flex navy">
    <div className="col-3 bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${safeLookupItemImage(image)})` }}>
      {'\u00a0'}
    </div>
    <div className="ml2 right-align flex-auto">
      <h2 className="h4 mt1">
        {name}
      </h2>
      <h2 className="h4 mt1 regular">
        <Currency amount={price} />
      </h2>
    </div>
  </Link>;

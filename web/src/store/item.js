import React from 'react';
import { Link } from 'react-router';
import safeLookupItemImage from '../item/safeLookupItemImage';
import './item.css';

export default ({ item: { id, name, price, image } }) =>
  <div className="store-item">
    <Link to={`/item/${id}`}>
      <div
        className="store-item-image"
        style={{ backgroundImage: `url(${safeLookupItemImage(image)})` }}
        alt={name}
      />
      <div className="store-item-description">
        <p>{name}</p>
        <p>{price}<small>p</small></p>
      </div>
    </Link>
  </div>;
